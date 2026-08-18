import Link from "next/link";
import { ChevronLeft, ChevronRight, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getProducts } from "@/features/products/data";
import { ProductStatusButton } from "@/features/products/product-status-button";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

type ProductsPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const requestedPage = Number.parseInt(params.page ?? "1", 10) || 1;
  const products = await getProducts({
    page: requestedPage,
    pageSize: PAGE_SIZE
  });

  function getProductStatusLabel(status: string) {
    if (status === "published") {
      return "已上架";
    }

    if (status === "unpublished") {
      return "已下架";
    }

    return "状态未知";
  }

  function getProductStatusClassName(status: string) {
    if (status === "published") {
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (status === "unpublished") {
      return "border-slate-200 bg-slate-50 text-slate-600";
    }

    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">产品列表</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          共 {products.total} 条产品，每页显示 {products.pageSize} 条。
        </p>
      </div>

      <div className="overflow-hidden rounded-md border bg-card">
        <table className="w-full table-fixed border-collapse text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="h-11 px-4 text-left font-medium">产品名</th>
              <th className="h-11 w-56 px-4 text-left font-medium">上传时间</th>
              <th className="h-11 w-72 px-4 text-left font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {products.items.length ? (
              products.items.map((product) => (
                <tr className="border-t" key={product.id}>
                  <td
                    className="h-12 truncate px-4 font-medium"
                    title={product.name}
                  >
                    {product.name}
                  </td>
                  <td className="h-12 px-4 text-muted-foreground">
                    {product.uploadedAt}
                  </td>
                  <td className="h-12 px-4">
                    <div className="flex items-center gap-2">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/dashboard/products/${product.id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          编辑
                        </Link>
                      </Button>
                      <ProductStatusButton
                        productId={product.id}
                        status={product.status}
                      />
                      <span
                        className={cn(
                          "inline-flex h-7 items-center rounded-full border px-2.5 text-xs font-medium",
                          getProductStatusClassName(product.status)
                        )}
                      >
                        {getProductStatusLabel(product.status)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="border-t">
                <td
                  className="h-32 px-4 text-center text-sm text-muted-foreground"
                  colSpan={3}
                >
                  暂无产品数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          第 {products.page} 页 / 共 {products.totalPages} 页
        </p>

        <div className="flex items-center gap-2">
          <Button
            asChild
            className={cn(
              products.page <= 1 && "pointer-events-none opacity-50"
            )}
            size="sm"
            variant="ghost"
          >
            <Link
              aria-disabled={products.page <= 1}
              href={`/dashboard/products?page=${Math.max(products.page - 1, 1)}`}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              上一页
            </Link>
          </Button>

          {Array.from({ length: products.totalPages }, (_, index) => {
            const page = index + 1;

            return (
              <Button
                asChild
                className="w-9 px-0"
                key={page}
                size="sm"
                variant={page === products.page ? "default" : "ghost"}
              >
                <Link href={`/dashboard/products?page=${page}`}>{page}</Link>
              </Button>
            );
          })}

          <Button
            asChild
            className={cn(
              products.page >= products.totalPages &&
                "pointer-events-none opacity-50"
            )}
            size="sm"
            variant="ghost"
          >
            <Link
              aria-disabled={products.page >= products.totalPages}
              href={`/dashboard/products?page=${Math.min(
                products.page + 1,
                products.totalPages
              )}`}
            >
              下一页
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
