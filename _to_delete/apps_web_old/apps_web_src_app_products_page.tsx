import { ProductGrid } from "@/components/products/product-grid";
import { getPublishedProducts } from "@/features/products/data";

export default async function ProductsPage() {
  const products = await getPublishedProducts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">产品中心</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          当前页面只读取已上架产品。
        </p>
      </div>
      <ProductGrid products={products} />
    </div>
  );
}
