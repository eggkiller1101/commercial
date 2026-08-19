type R2UploadInput = {
  contentType: string;
  fileName: string;
  folder: string;
  payload: ArrayBuffer;
};

type R2UploadResult =
  | {
      key: string;
      ok: true;
      url: string;
    }
  | {
      message: string;
      ok: false;
    };

const r2Region = "auto";
const r2Service = "s3";

function getR2Config() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucketName = process.env.R2_BUCKET_NAME;
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL;

  if (
    !accountId ||
    !accessKeyId ||
    !secretAccessKey ||
    !bucketName ||
    !publicBaseUrl
  ) {
    return null;
  }

  return {
    accessKeyId,
    bucketName,
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    publicBaseUrl: publicBaseUrl.replace(/\/+$/, ""),
    secretAccessKey
  };
}

function encodePathSegment(value: string) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (character) =>
    `%${character.charCodeAt(0).toString(16).toUpperCase()}`
  );
}

function sanitizePathPart(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function getFileExtension(fileName: string) {
  return sanitizePathPart(fileName.split(".").pop() || "file");
}

function bytesToHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function textToBytes(value: string) {
  return new TextEncoder().encode(value);
}

async function sha256Hex(value: string | ArrayBuffer) {
  const data = typeof value === "string" ? textToBytes(value) : value;
  const hash = await crypto.subtle.digest("SHA-256", data);

  return bytesToHex(hash);
}

async function hmacSha256(key: ArrayBuffer, value: string) {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { hash: "SHA-256", name: "HMAC" },
    false,
    ["sign"]
  );

  return crypto.subtle.sign("HMAC", cryptoKey, textToBytes(value));
}

async function getSignatureKey(secretAccessKey: string, dateStamp: string) {
  const dateKey = await hmacSha256(
    textToBytes(`AWS4${secretAccessKey}`).buffer,
    dateStamp
  );
  const regionKey = await hmacSha256(dateKey, r2Region);
  const serviceKey = await hmacSha256(regionKey, r2Service);

  return hmacSha256(serviceKey, "aws4_request");
}

function getAmzDate(date: Date) {
  return date.toISOString().replace(/[:-]|\.\d{3}/g, "");
}

export async function uploadFileToR2(
  input: R2UploadInput
): Promise<R2UploadResult> {
  const config = getR2Config();

  if (!config) {
    return {
      message:
        "R2 存储尚未配置，请检查 R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET_NAME / R2_PUBLIC_BASE_URL",
      ok: false
    };
  }

  const now = new Date();
  const amzDate = getAmzDate(now);
  const dateStamp = amzDate.slice(0, 8);
  const extension = getFileExtension(input.fileName);
  const safeFolder = sanitizePathPart(input.folder) || "uploads";
  const safeName = sanitizePathPart(input.fileName.replace(/\.[^.]+$/, ""));
  const objectKey = `${safeFolder}/${dateStamp}/${crypto.randomUUID()}-${
    safeName || "file"
  }.${extension}`;
  const canonicalUri = `/${config.bucketName}/${objectKey
    .split("/")
    .map(encodePathSegment)
    .join("/")}`;
  const uploadUrl = `${config.endpoint}${canonicalUri}`;
  const payloadHash = await sha256Hex(input.payload);
  const host = new URL(config.endpoint).host;
  const canonicalHeaders = [
    `host:${host}`,
    `x-amz-content-sha256:${payloadHash}`,
    `x-amz-date:${amzDate}`
  ].join("\n");
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = [
    "PUT",
    canonicalUri,
    "",
    `${canonicalHeaders}\n`,
    signedHeaders,
    payloadHash
  ].join("\n");
  const credentialScope = `${dateStamp}/${r2Region}/${r2Service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    await sha256Hex(canonicalRequest)
  ].join("\n");
  const signingKey = await getSignatureKey(config.secretAccessKey, dateStamp);
  const signature = bytesToHex(await hmacSha256(signingKey, stringToSign));
  const authorization = [
    `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}`,
    `SignedHeaders=${signedHeaders}`,
    `Signature=${signature}`
  ].join(", ");

  const response = await fetch(uploadUrl, {
    body: input.payload,
    headers: {
      Authorization: authorization,
      "Content-Type": input.contentType || "application/octet-stream",
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate
    },
    method: "PUT"
  });

  if (!response.ok) {
    const message = await response.text();

    return {
      message: message || `R2 上传失败，状态码：${response.status}`,
      ok: false
    };
  }

  return {
    key: objectKey,
    ok: true,
    url: `${config.publicBaseUrl}/${objectKey
      .split("/")
      .map(encodePathSegment)
      .join("/")}`
  };
}
