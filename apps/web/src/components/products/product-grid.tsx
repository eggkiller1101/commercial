import { ProductCard } from "@/components/products/product-card";
import type { ProductCardItem } from "@/features/products/data";
import { t, type Locale } from "@/lib/i18n/dictionary";

export function ProductGrid({
  locale,
  products
}: {
  locale: Locale;
  products: ProductCardItem[];
}) {
  if (!products.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        {t(locale, "products.noPublished")}
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} locale={locale} product={product} />
      ))}
    </div>
  );
}
