import Link from "next/link";
import Image from "next/image";

import type { ProductCardItem } from "@/features/products/data";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function ProductCard({
  dictionary,
  product
}: {
  dictionary: Dictionary;
  product: ProductCardItem;
}) {
  const common = dictionary.common;
  const products = dictionary.products;

  return (
    <Link
      className="group block rounded-md border bg-card p-4 transition-colors hover:border-primary"
      href={`/products/${product.slug || product.id}`}
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
          common.noImage
        )}
      </div>
      <div className="mt-4 space-y-1">
        <p className="text-xs text-muted-foreground">
          {product.categoryName || product.subcategoryName || products.breadcrumb}
        </p>
        <h3 className="font-medium group-hover:text-primary">{product.name}</h3>
        <p className="text-xs text-muted-foreground">{product.modelNumber}</p>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {product.summary || products.noDescription}
        </p>
      </div>
    </Link>
  );
}
