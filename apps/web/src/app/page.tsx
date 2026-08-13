import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/products/product-grid";
import { getFeaturedProducts } from "@/features/products/data";

export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <div>
      <section className="border-b bg-card">
        <div className="mx-auto grid min-h-[28rem] max-w-6xl gap-8 px-4 py-16 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold tracking-normal md:text-5xl">
              企业产品展示与询价平台
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              展示已上架产品、资料文件和分类内容，并为客户提供询价入口。
            </p>
            <div className="flex gap-3">
              <Button asChild>
                <Link href="/products">查看产品</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href="/inquiry">提交询价</Link>
              </Button>
            </div>
          </div>
          <div className="flex aspect-[4/3] items-center justify-center rounded-md bg-muted text-muted-foreground">
            首页主视觉预留
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold">推荐产品</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              只展示 CMS 中 status 为 published 的产品。
            </p>
          </div>
          <Button asChild size="sm" variant="ghost">
            <Link href="/products">全部产品</Link>
          </Button>
        </div>
        <ProductGrid products={products} />
      </section>
    </div>
  );
}
