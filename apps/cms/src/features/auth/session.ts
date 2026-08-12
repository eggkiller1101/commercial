import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const CMS_SESSION_COOKIE = "cms_admin_session";

const SESSION_MAX_AGE = 60 * 60 * 8;

export type CmsSession = {
  adminUserId: number;
  roleName: string;
  username: string;
};

function getSessionSecret() {
  return process.env.CMS_SESSION_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
}

function signPayload(payload: string) {
  const secret = getSessionSecret();

  if (!secret) {
    return null;
  }

  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function isValidSignature(payload: string, signature: string) {
  const expectedSignature = signPayload(payload);

  if (!expectedSignature) {
    return false;
  }

  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (signatureBuffer.length !== expectedSignatureBuffer.length) {
    return false;
  }

  return timingSafeEqual(signatureBuffer, expectedSignatureBuffer);
}

export async function getCmsSession(): Promise<CmsSession | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(CMS_SESSION_COOKIE)?.value;

  if (!value) {
    return null;
  }

  try {
    const [payload, signature] = value.split(".");

    if (!payload || !signature || !isValidSignature(payload, signature)) {
      return null;
    }

    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

export async function setCmsSession(session: CmsSession) {
  const cookieStore = await cookies();
  const payload = Buffer.from(JSON.stringify(session), "utf8").toString(
    "base64url"
  );
  const signature = signPayload(payload);

  if (!signature) {
    throw new Error("CMS session secret is not configured.");
  }

  cookieStore.set(CMS_SESSION_COOKIE, `${payload}.${signature}`, {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}

export async function clearCmsSession() {
  const cookieStore = await cookies();

  cookieStore.delete(CMS_SESSION_COOKIE);
}
