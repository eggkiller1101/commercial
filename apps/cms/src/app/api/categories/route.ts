import { NextResponse } from "next/server";

import { createCategory } from "@/features/categories/data";

type CategoryRequestBody = {
  categoryName?: string;
  description?: string;
  slug?: string;
};

export async function POST(request: Request) {
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

  const result = await createCategory({
    categoryName: body.categoryName,
    description: body.description,
    slug: body.slug
  });

  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: 400 });
  }

  return NextResponse.json(result, { status: 201 });
}
