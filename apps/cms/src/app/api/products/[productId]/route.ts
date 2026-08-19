import { NextResponse } from "next/server";

import { requireApiPermission } from "@/features/auth/guards";
import { updateProduct } from "@/features/products/data";

type ProductRouteProps = {
  params: Promise<{
    productId: string;
  }>;
};

type ProductRequestBody = {
  applicationNotes?: string;
  description?: string;
  imageUrls?: string[];
  isFeatured?: boolean;
  primaryCategoryId?: string;
  productModel?: string;
  productName?: string;
  sku?: string;
  subcategoryId?: string;
  summary?: string;
};

export async function PATCH(request: Request, { params }: ProductRouteProps) {
  const permission = await requireApiPermission("manage_content");

  if (permission.response) {
    return permission.response;
  }

  const { productId } = await params;
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

  const result = await updateProduct({
    applicationNotes: body.applicationNotes ?? "",
    databaseId: productId,
    description: body.description,
    imageUrls: Array.isArray(body.imageUrls) ? body.imageUrls : [],
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

  return NextResponse.json(result);
}
