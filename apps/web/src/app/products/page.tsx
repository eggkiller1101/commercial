import { ProductsCatalog } from "@/components/products/products-catalog";
import { getCategoryTree } from "@/features/categories/data";
import {
  getFilterableAttributeDefinitions,
  getPublishedProducts
} from "@/features/products/data";

export default async function ProductsPage() {
  const [categories, products, attributeDefinitions] = await Promise.all([
    getCategoryTree(),
    getPublishedProducts(),
    getFilterableAttributeDefinitions()
  ]);

  return (
    <ProductsCatalog
      attributeDefinitions={attributeDefinitions}
      categories={categories}
      products={products}
    />
  );
}
