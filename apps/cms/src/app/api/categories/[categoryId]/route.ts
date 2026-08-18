import { NextResponse } from "next/server";

import { requireApiPermission } from "@/features/auth/guards";
import { updateCategory } from "@/features/categories/data";

type CategoryRouteProps = {
  params: Promise<{
    categoryId: string;
  }>;
};

type CategoryRequestBody = {
  categoryName?: string;
  description?: string;
  slug?: string;
};

export async function PATCH(
  request: Request,
  { params }: CategoryRouteProps
) {
  const permission = await requireApiPermission("manage_content");

  if (permission.response) {
    return permission.response;
  }

  const { categoryId } = await params;
  const body = (await request.json()) as CategoryRequestBody;

  if (
    !body.categoryName?.trim() ||
    !body.slug?.trim() ||
    !body.description?.trim()
  ) {
    return NextResponse.json(
      { message: "分类名称、分类slug、分类描述均为必填" },
      { status: 400 }
    );
  }

  const result = await updateCategory({
    categoryId,
    categoryName: body.categoryName,
    description: body.description,
    slug: body.slug
  });

  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: 400 });
  }

  return NextResponse.json(result);
}
