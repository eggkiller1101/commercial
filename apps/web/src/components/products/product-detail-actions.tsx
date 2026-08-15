"use client";

import Link from "next/link";
import { useState } from "react";

import { useCart } from "@/features/quote-cart/cart-context";
import type { ProductDetail } from "@/features/products/data";

export function ProductDetailActions({ product }: { product: ProductDetail }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <div className="flex flex-wrap gap-3">
      <button
        className="inline-flex h-[42px] items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary-600"
        onClick={() => {
          addItem({
            categoryName: product.categoryName,
            id: product.id,
            imageUrl: product.imageUrl,
            modelNumber: product.modelNumber,
            name: product.name
          });
          setAdded(true);
          window.setTimeout(() => setAdded(false), 1600);
        }}
        type="button"
      >
        {added ? "已加入询价清单 ✓" : "加入询价清单"}
      </button>
      <Link
        className="inline-flex h-[42px] items-center justify-center rounded-md border border-border px-6 text-sm font-semibold text-foreground hover:border-primary-500 hover:text-primary-600"
        href="/quote-cart"
      >
        查看询价清单 →
      </Link>
    </div>
  );
}
