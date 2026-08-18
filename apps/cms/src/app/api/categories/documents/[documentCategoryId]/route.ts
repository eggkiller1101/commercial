import { NextResponse } from "next/server";

import { requireApiPermission } from "@/features/auth/guards";
import { updateDocumentCategory } from "@/features/categories/data";

type DocumentCategoryRouteProps = {
  params: Promise<{
    documentCategoryId: string;
  }>;
};

type DocumentCategoryRequestBody = {
  name?: string;
  slug?: string;
};

export async function PATCH(
  request: Request,
  { params }: DocumentCategoryRouteProps
) {
  const permission = await requireApiPermission("manage_content");

  if (permission.response) {
    return permission.response;
  }

  const { documentCategoryId } = await params;
  const body = (await request.json()) as DocumentCategoryRequestBody;

  if (!body.name?.trim() || !body.slug?.trim()) {
    return NextResponse.json(
      { message: "资料分类名称、资料分类 slug 均为必填" },
      { status: 400 }
    );
  }

  const result = await updateDocumentCategory({
    documentCategoryId,
    name: body.name,
    slug: body.slug
  });

  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: 400 });
  }

  return NextResponse.json(result);
}
