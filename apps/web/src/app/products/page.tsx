import { ProductsCatalog } from "@/components/products/products-catalog";
import { getCategoryTree } from "@/features/categories/data";
import {
  getFilterableAttributeDefinitions,
  getPublishedProductPage
} from "@/features/products/data";
import { getRequestLocale } from "@/lib/i18n/server";

export default async function ProductsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const queryParams = await searchParams;
  const initialQuery = new URLSearchParams();

  Object.entries(queryParams).forEach(([key, value]) => {
    const firstValue = Array.isArray(value) ? value[0] : value;

    if (firstValue !== undefined) {
      initialQuery.set(key, firstValue);
    }
  });

  const [categories, products, attributeDefinitions, locale] = await Promise.all([
    getCategoryTree(),
    getPublishedProductPage({
      attributes: Object.fromEntries(
        Array.from(initialQuery.entries())
          .filter(([key]) => key.startsWith("attr_"))
          .map(([key, value]) => {
            try {
              return [key.slice(5), JSON.parse(value)];
            } catch {
              return [key.slice(5), [value]];
            }
          })
      ),
      categorySlug: initialQuery.get("category") ?? undefined,
      keyword: initialQuery.get("q") ?? undefined,
      page: Number(initialQuery.get("page")) || 1,
      sort:
        initialQuery.get("sort") === "name_asc" ||
        initialQuery.get("sort") === "model_asc"
          ? (initialQuery.get("sort") as "name_asc" | "model_asc")
          : "newest"
    }),
    getFilterableAttributeDefinitions(),
    getRequestLocale()
  ]);

  return (
    <ProductsCatalog
      attributeDefinitions={attributeDefinitions}
      categories={categories}
      initialQuery={initialQuery.toString()}
      locale={locale}
      products={products.items}
      totalProducts={products.total}
      totalPages={products.totalPages}
    />
  );
}
