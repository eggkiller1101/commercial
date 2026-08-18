import { NextResponse } from "next/server";

import { requireApiPermission } from "@/features/auth/guards";
import { createDocumentCategory } from "@/features/categories/data";

type DocumentCategoryRequestBody = {
  name?: string;
  slug?: string;
};

export async function POST(request: Request) {
  const permission = await requireApiPermission("manage_content");

  if (permission.response) {
    return permission.response;
  }

  const body = (await request.json()) as DocumentCategoryRequestBody;

  if (!body.name?.trim() || !body.slug?.trim()) {
    return NextResponse.json(
      { message: "资料分类名称、资料分类 slug 均为必填" },
      { status: 400 }
    );
  }

  const result = await createDocumentCategory({
    name: body.name,
    slug: body.slug
  });

  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: 400 });
  }

  return NextResponse.json(result, { status: 201 });
}
