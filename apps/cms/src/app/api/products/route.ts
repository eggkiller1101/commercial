import { NextResponse } from "next/server";

import { createProduct } from "@/features/products/data";

type ProductRequestBody = {
  category?: string;
  description?: string;
  productId?: string;
  productName?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as ProductRequestBody;

  if (
    !body.productName?.trim() ||
    !body.productId?.trim() ||
    !body.description?.trim() ||
    !body.category?.trim()
  ) {
    return NextResponse.json(
      { message: "产品名称、产品id、产品描述、产品分类均为必填" },
      { status: 400 }
    );
  }

  const result = await createProduct({
    category: body.category,
    description: body.description,
    productId: body.productId,
    productName: body.productName
  });

  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: 400 });
  }

  return NextResponse.json(result, { status: 201 });
}
