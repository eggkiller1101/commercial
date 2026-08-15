"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { useCart } from "@/features/quote-cart/cart-context";
import type { ProductCardItem } from "@/features/products/data";
import { t, type Locale } from "@/lib/i18n/dictionary";

export function ProductCard({
  locale,
  product
}: {
  locale: Locale;
  product: ProductCardItem;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md">
      <Link className="block" href={`/products/${product.id}`}>
        <div className="flex aspect-[4/3] items-center justify-center bg-neutral-100">
          <Image
            alt={product.name}
            className="h-3/5 w-3/5 object-contain"
            height={200}
            src={product.imageUrl ?? "/icons/generic-product.svg"}
            width={200}
          />
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-xs font-bold tracking-wide text-primary-600">
          {product.modelNumber}
        </p>
        <Link href={`/products/${product.id}`}>
          <h3 className="text-[15px] leading-snug text-foreground hover:text-primary-600">
            {product.name}
          </h3>
        </Link>
        <p className="line-clamp-2 flex-1 text-[12.5px] text-muted-foreground">
          {product.summary || t(locale, "products.noSummary")}
        </p>
        <div className="mt-2.5 flex gap-2">
          <Link
            className="flex h-9 flex-1 items-center justify-center rounded-md border border-border text-[12.5px] font-semibold text-foreground hover:border-primary-500 hover:text-primary-600"
            href={`/products/${product.id}`}
          >
            {t(locale, "products.viewDetail")}
          </Link>
          <button
            className="flex h-9 flex-1 items-center justify-center rounded-md bg-primary text-[12.5px] font-semibold text-primary-foreground hover:bg-primary-600"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              addItem({
                categoryName: "",
                id: product.id,
                imageUrl: product.imageUrl,
                modelNumber: product.modelNumber,
                name: product.name
              });
              setAdded(true);
              window.setTimeout(() => setAdded(false), 1400);
            }}
            type="button"
          >
            {added ? t(locale, "products.added") : t(locale, "products.addToCart")}
          </button>
        </div>
      </div>
    </div>
  );
}
