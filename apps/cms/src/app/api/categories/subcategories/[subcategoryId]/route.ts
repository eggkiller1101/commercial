import { NextResponse } from "next/server";

import { requireApiPermission } from "@/features/auth/guards";
import { updateSubcategory } from "@/features/categories/data";

type SubcategoryRouteProps = {
  params: Promise<{
    subcategoryId: string;
  }>;
};

type SubcategoryRequestBody = {
  categoryId?: string;
  slug?: string;
  subcategoryName?: string;
};

export async function PATCH(
  request: Request,
  { params }: SubcategoryRouteProps
) {
  const permission = await requireApiPermission("manage_content");

  if (permission.response) {
    return permission.response;
  }

  const { subcategoryId } = await params;
  const body = (await request.json()) as SubcategoryRequestBody;

  if (
    !body.categoryId?.trim() ||
    !body.subcategoryName?.trim() ||
    !body.slug?.trim()
  ) {
    return NextResponse.json(
      { message: "所属一级分类、二级分类名称、二级分类 slug 均为必填" },
      { status: 400 }
    );
  }

  const result = await updateSubcategory({
    categoryId: body.categoryId,
    slug: body.slug,
    subcategoryId,
    subcategoryName: body.subcategoryName
  });

  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: 400 });
  }

  return NextResponse.json(result);
}
