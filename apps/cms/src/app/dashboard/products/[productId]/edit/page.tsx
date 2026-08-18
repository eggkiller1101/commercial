import { notFound } from "next/navigation";

import { ProductForm } from "@/features/products/product-form";
import {
  getProductById,
  getProductFormOptions
} from "@/features/products/data";

type EditProductPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { productId } = await params;
  const [product, options] = await Promise.all([
    getProductById(productId),
    getProductFormOptions()
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold">产品编辑</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          当前内容从数据库读取并填充。
        </p>
      </div>

      <ProductForm defaultValues={product} options={options} />
    </div>
  );
}
