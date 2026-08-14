import { NextResponse } from "next/server";

import { requireApiPermission } from "@/features/auth/guards";
import { updateProductStatus } from "@/features/products/data";

type ProductStatusRouteProps = {
  params: Promise<{
    productId: string;
  }>;
};

type ProductStatusRequestBody = {
  status?: string;
};

export async function PATCH(
  request: Request,
  { params }: ProductStatusRouteProps
) {
  const permission = await requireApiPermission("manage_content");

  if (permission.response) {
    return permission.response;
  }

  const { productId } = await params;
  const body = (await request.json()) as ProductStatusRequestBody;

  if (body.status !== "published" && body.status !== "unpublished") {
    return NextResponse.json(
      { message: "产品状态无效", ok: false },
      { status: 400 }
    );
  }

  const result = await updateProductStatus({
    productId,
    status: body.status
  });

  if (!result.ok) {
    return NextResponse.json({ message: result.message, ok: false }, { status: 400 });
  }

  return NextResponse.json(result);
}
