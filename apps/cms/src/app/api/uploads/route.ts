import { NextResponse } from "next/server";

import { requireApiPermission } from "@/features/auth/guards";
import { uploadFileToR2 } from "@/lib/r2";

const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;
const MAX_DOCUMENT_SIZE_BYTES = 30 * 1024 * 1024;

const UPLOAD_FOLDERS = {
  caseCover: "case-covers",
  document: "documents",
  productImage: "product-images"
} as const;

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png"]);
const ALLOWED_DOCUMENT_TYPES = new Set([
  "application/csv",
  "application/msword",
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/csv"
]);

type UploadKind = keyof typeof UPLOAD_FOLDERS;

function isUploadKind(value: FormDataEntryValue | null): value is UploadKind {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(UPLOAD_FOLDERS, value)
  );
}

function getFileExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() || "";
}

function isAllowedDocument(file: File) {
  const extension = getFileExtension(file.name);

  return (
    ALLOWED_DOCUMENT_TYPES.has(file.type) ||
    ["csv", "doc", "docx", "pdf", "xls", "xlsx"].includes(extension)
  );
}

export async function POST(request: Request) {
  const permission = await requireApiPermission("manage_content");

  if (permission.response) {
    return permission.response;
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const kind = formData.get("kind");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { message: "请选择需要上传的文件", ok: false },
      { status: 400 }
    );
  }

  if (!isUploadKind(kind)) {
    return NextResponse.json(
      { message: "上传类型无效", ok: false },
      { status: 400 }
    );
  }

  if (kind === "productImage" || kind === "caseCover") {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json(
        { message: "图片只支持 jpeg、png 格式", ok: false },
        { status: 400 }
      );
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        { message: "图片不能超过 8MB", ok: false },
        { status: 400 }
      );
    }
  }

  if (kind === "document") {
    if (!isAllowedDocument(file)) {
      return NextResponse.json(
        { message: "资料文件只支持 pdf、csv、doc、docx、xls、xlsx 格式", ok: false },
        { status: 400 }
      );
    }

    if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
      return NextResponse.json(
        { message: "资料文件不能超过 30MB", ok: false },
        { status: 400 }
      );
    }
  }

  const result = await uploadFileToR2({
    contentType: file.type || "application/octet-stream",
    fileName: file.name,
    folder: UPLOAD_FOLDERS[kind],
    payload: await file.arrayBuffer()
  });

  if (!result.ok) {
    return NextResponse.json(
      { message: result.message, ok: false },
      { status: 500 }
    );
  }

  return NextResponse.json({
    contentType: file.type || "application/octet-stream",
    fileName: file.name,
    key: result.key,
    ok: true,
    size: file.size,
    url: result.url
  });
}
