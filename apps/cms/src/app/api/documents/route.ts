import { NextResponse } from "next/server";

import { requireApiPermission } from "@/features/auth/guards";
import { createDocument } from "@/features/documents/data";

type DocumentRequestBody = {
  fileType?: string;
  fileUrl?: string;
  language?: string;
  title?: string;
  version?: string;
};

export async function POST(request: Request) {
  const permission = await requireApiPermission("manage_content");

  if (permission.response) {
    return permission.response;
  }

  const body = (await request.json()) as DocumentRequestBody;

  if (
    !body.title?.trim() ||
    !body.fileType?.trim() ||
    !body.language?.trim()
  ) {
    return NextResponse.json(
      { message: "文件标题、文件类型、语言均为必填" },
      { status: 400 }
    );
  }

  const result = await createDocument({
    fileType: body.fileType,
    fileUrl: body.fileUrl,
    language: body.language,
    title: body.title,
    version: body.version ?? ""
  });

  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: 400 });
  }

  return NextResponse.json(result, { status: 201 });
}
