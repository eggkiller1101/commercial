import { NextResponse } from "next/server";

import { requireApiPermission } from "@/features/auth/guards";
import { createProduct } from "@/features/products/data";

type ProductRequestBody = {
  applicationNotes?: string;
  description?: string;
  isFeatured?: boolean;
  primaryCategoryId?: string;
  productModel?: string;
  productName?: string;
  sku?: string;
  subcategoryId?: string;
  summary?: string;
};

export async function POST(request: Request) {
  const permission = await requireApiPermission("manage_content");

  if (permission.response) {
    return permission.response;
  }

  const body = (await request.json()) as ProductRequestBody;

  if (
    !body.productName?.trim() ||
    !body.productModel?.trim() ||
    !body.summary?.trim() ||
    !body.description?.trim() ||
    !body.primaryCategoryId?.trim() ||
    !body.subcategoryId?.trim() ||
    !body.sku?.trim()
  ) {
    return NextResponse.json(
      {
        message:
          "产品名称、产品型号、产品简介、产品描述、一级分类、二级分类、SKU 编码均为必填"
      },
      { status: 400 }
    );
  }

  const result = await createProduct({
    applicationNotes: body.applicationNotes ?? "",
    description: body.description,
    isFeatured: body.isFeatured === true,
    primaryCategoryId: body.primaryCategoryId,
    productModel: body.productModel,
    productName: body.productName,
    sku: body.sku,
    subcategoryId: body.subcategoryId,
    summary: body.summary
  });

  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: 400 });
  }

  return NextResponse.json(result, { status: 201 });
}
