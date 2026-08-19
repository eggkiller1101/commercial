import { ProductCard } from "@/components/products/product-card";
import type { ProductCardItem } from "@/features/products/data";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function ProductGrid({
  dictionary,
  products
}: {
  dictionary: Dictionary;
  products: ProductCardItem[];
}) {
  if (!products.length) {
    return (
      <div className="rounded-md border bg-card p-10 text-center text-sm text-muted-foreground">
        {dictionary.products.empty}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard dictionary={dictionary} key={product.id} product={product} />
      ))}
    </div>
  );
}
