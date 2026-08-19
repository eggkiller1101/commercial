export type UploadKind = "caseCover" | "document" | "productImage";

export type UploadResult =
  | {
      contentType: string;
      fileName: string;
      key: string;
      ok: true;
      size: number;
      url: string;
    }
  | {
      message: string;
      ok: false;
    };

export async function uploadCmsFile(file: File, kind: UploadKind) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("kind", kind);

  const response = await fetch("/api/uploads", {
    body: formData,
    method: "POST"
  });
  const result = (await response.json()) as UploadResult;

  if (!result.ok) {
    return {
      message: result.message || "文件上传失败，请稍后重试",
      ok: false as const
    };
  }

  if (!response.ok) {
    return {
      message: "文件上传失败，请稍后重试",
      ok: false as const
    };
  }

  return result;
}
