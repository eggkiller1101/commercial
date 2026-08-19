import { ProductsCatalog } from "@/components/products/products-catalog";
import { getCategoryTree } from "@/features/categories/data";
import {
  getFilterableAttributeDefinitions,
  getPublishedProducts
} from "@/features/products/data";
import { getRequestLocale } from "@/lib/i18n/server";

export default async function ProductsPage() {
  const [categories, products, attributeDefinitions, locale] = await Promise.all([
    getCategoryTree(),
    getPublishedProducts(),
    getFilterableAttributeDefinitions(),
    getRequestLocale()
  ]);

  return (
    <ProductsCatalog
      attributeDefinitions={attributeDefinitions}
      categories={categories}
      locale={locale}
      products={products}
    />
  );
}
