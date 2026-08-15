import { notFound } from "next/navigation";
import Image from "next/image";

import { Button } from "@/components/ui/button";
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
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-3">
        <div className="flex aspect-[4/3] items-center justify-center rounded-md border bg-muted text-muted-foreground">
          {product.imageUrl ? (
            <Image
              alt={product.name}
              className="h-full w-full rounded-md object-cover"
              height={480}
              src={product.imageUrl}
              width={640}
            />
          ) : (
            "暂无图片"
          )}
        </div>
        {product.images.length > 1 ? (
          <div className="grid grid-cols-4 gap-2">
            {product.images.slice(1, 5).map((image) => (
              <Image
                alt={product.name}
                className="aspect-square rounded-md border object-cover"
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
          <p className="text-sm text-muted-foreground">
            {product.categoryName || "产品分类"}
          </p>
          <h1 className="mt-2 text-3xl font-semibold">{product.name}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            产品型号：{product.modelNumber}
          </p>
        </div>
        <p className="leading-7 text-muted-foreground">
          {product.description || product.summary || "暂无产品详情"}
        </p>
        <Button asChild>
          <a href={`/inquiry?productId=${product.id}`}>咨询该产品</a>
        </Button>
      </section>
    </div>
  );
}
