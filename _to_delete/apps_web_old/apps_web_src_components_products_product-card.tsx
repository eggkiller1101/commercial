import Link from "next/link";
import Image from "next/image";

import type { ProductCardItem } from "@/features/products/data";

export function ProductCard({ product }: { product: ProductCardItem }) {
  return (
    <Link
      className="group block rounded-md border bg-card p-4 transition-colors hover:border-primary"
      href={`/products/${product.id}`}
    >
      <div className="flex aspect-[4/3] items-center justify-center rounded-md bg-muted text-sm text-muted-foreground">
        {product.imageUrl ? (
          <Image
            alt={product.name}
            className="h-full w-full rounded-md object-cover"
            height={300}
            src={product.imageUrl}
            width={400}
          />
        ) : (
          "暂无图片"
        )}
      </div>
      <div className="mt-4 space-y-1">
        <p className="text-xs text-muted-foreground">{product.modelNumber}</p>
        <h3 className="font-medium group-hover:text-primary">{product.name}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {product.summary || "暂无产品简介"}
        </p>
      </div>
    </Link>
  );
}
