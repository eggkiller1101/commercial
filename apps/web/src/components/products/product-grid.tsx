import { ProductCard } from "@/components/products/product-card";
import type { ProductCardItem } from "@/features/products/data";

export function ProductGrid({ products }: { products: ProductCardItem[] }) {
  if (!products.length) {
    return (
      <div className="rounded-md border bg-card p-10 text-center text-sm text-muted-foreground">
        暂无已上架产品
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
