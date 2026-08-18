import { NextResponse } from "next/server";

import { requireApiPermission } from "@/features/auth/guards";
import { updateDocument } from "@/features/documents/data";

type DocumentRouteProps = {
  params: Promise<{
    documentId: string;
  }>;
};

type DocumentRequestBody = {
  categoryId?: string;
  fileType?: string;
  fileUrl?: string;
  language?: string;
  title?: string;
  version?: string;
};

export async function PATCH(request: Request, { params }: DocumentRouteProps) {
  const permission = await requireApiPermission("manage_content");

  if (permission.response) {
    return permission.response;
  }

  const { documentId } = await params;
  const body = (await request.json()) as DocumentRequestBody;

  if (
    !body.categoryId?.trim() ||
    !body.title?.trim() ||
    !body.fileType?.trim() ||
    !body.language?.trim()
  ) {
    return NextResponse.json(
      { message: "资料分类、资料标题、资料类型、语言均为必填" },
      { status: 400 }
    );
  }

  const result = await updateDocument({
    categoryId: body.categoryId,
    documentId,
    fileType: body.fileType,
    fileUrl: body.fileUrl,
    language: body.language,
    title: body.title,
    version: body.version ?? ""
  });

  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: 400 });
  }

  return NextResponse.json(result);
}
