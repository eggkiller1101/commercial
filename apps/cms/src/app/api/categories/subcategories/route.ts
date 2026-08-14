import { NextResponse } from "next/server";

import { requireApiPermission } from "@/features/auth/guards";
import { createSubcategory } from "@/features/categories/data";

type SubcategoryRequestBody = {
  categoryId?: string;
  slug?: string;
  subcategoryName?: string;
};

export async function POST(request: Request) {
  const permission = await requireApiPermission("manage_content");

  if (permission.response) {
    return permission.response;
  }

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

  const result = await createSubcategory({
    categoryId: body.categoryId,
    slug: body.slug,
    subcategoryName: body.subcategoryName
  });

  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: 400 });
  }

  return NextResponse.json(result, { status: 201 });
}
