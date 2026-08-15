import { notFound } from "next/navigation";
import Image from "next/image";

import { ProductDetailActions } from "@/components/products/product-detail-actions";
import { getPublishedProductById } from "@/features/products/data";

type ProductDetailPageProps = {
  params: Promise<{
    productId: string;
  }>;
};

export default async function ProductDetailPage({
  params
}: ProductDetailPageProps) {
  const { productId } = await params;
  const product = await getPublishedProductById(productId);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto grid max-w-site gap-10 px-4 py-10 md:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-3">
        <div className="flex aspect-[4/3] items-center justify-center rounded-lg border border-border bg-neutral-100">
          <Image
            alt={product.name}
            className="h-3/5 w-3/5 object-contain"
            height={480}
            src={product.imageUrl ?? "/icons/generic-product.svg"}
            width={640}
          />
        </div>
        {product.images.length > 1 ? (
          <div className="grid grid-cols-4 gap-2">
            {product.images.slice(1, 5).map((image) => (
              <Image
                alt={product.name}
                className="aspect-square rounded-md border border-border object-cover"
                height={160}
                key={image}
                src={image}
                width={160}
              />
            ))}
          </div>
        ) : null}
      </div>

      <section className="space-y-6">
        <div>
          <p className="text-sm font-medium text-primary-600">
            {product.categoryName || "产品分类"}
          </p>
          <h1 className="mt-2 text-[28px] font-bold leading-tight">{product.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            产品型号：<span className="font-semibold text-foreground">{product.modelNumber}</span>
          </p>
        </div>
        <p className="leading-7 text-muted-foreground">
          {product.description || product.summary || "暂无产品详情"}
        </p>
        <ProductDetailActions product={product} />
      </section>
    </div>
  );
}
