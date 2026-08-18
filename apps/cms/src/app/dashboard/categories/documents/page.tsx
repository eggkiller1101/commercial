import Link from "next/link";
import { ChevronLeft, ChevronRight, Pencil, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getDocumentCategories } from "@/features/categories/data";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

type DocumentCategoriesPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function DocumentCategoriesPage({
  searchParams
}: DocumentCategoriesPageProps) {
  const params = await searchParams;
  const requestedPage = Number.parseInt(params.page ?? "1", 10) || 1;
  const categories = await getDocumentCategories({
    page: requestedPage,
    pageSize: PAGE_SIZE
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">资料分类</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            共 {categories.total} 条资料分类，每页显示 {categories.pageSize} 条。
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/dashboard/categories/documents/new">
            <Plus className="mr-2 h-4 w-4" />
            新增资料分类
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-md border bg-card">
        <table className="w-full table-fixed border-collapse text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="h-11 px-4 text-left font-medium">资料分类名</th>
              <th className="h-11 w-64 px-4 text-left font-medium">slug</th>
              <th className="h-11 w-56 px-4 text-left font-medium">创建时间</th>
              <th className="h-11 w-32 px-4 text-left font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {categories.items.length ? (
              categories.items.map((category) => (
                <tr className="border-t" key={category.id}>
                  <td
                    className="h-12 truncate px-4 font-medium"
                    title={category.name}
                  >
                    {category.name}
                  </td>
                  <td
                    className="h-12 truncate px-4 text-muted-foreground"
                    title={category.slug}
                  >
                    {category.slug}
                  </td>
                  <td className="h-12 px-4 text-muted-foreground">
                    {category.uploadedAt}
                  </td>
                  <td className="h-12 px-4">
                    <Button asChild size="sm" variant="ghost">
                      <Link
                        href={`/dashboard/categories/documents/${category.id}/edit`}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        编辑
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="border-t">
                <td
                  className="h-32 px-4 text-center text-sm text-muted-foreground"
                  colSpan={4}
                >
                  暂无资料分类数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          第 {categories.page} 页 / 共 {categories.totalPages} 页
        </p>

        <div className="flex items-center gap-2">
          <Button
            asChild
            className={cn(
              categories.page <= 1 && "pointer-events-none opacity-50"
            )}
            size="sm"
            variant="ghost"
          >
            <Link
              aria-disabled={categories.page <= 1}
              href={`/dashboard/categories/documents?page=${Math.max(
                categories.page - 1,
                1
              )}`}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              上一页
            </Link>
          </Button>

          {Array.from({ length: categories.totalPages }, (_, index) => {
            const page = index + 1;

            return (
              <Button
                asChild
                className="w-9 px-0"
                key={page}
                size="sm"
                variant={page === categories.page ? "default" : "ghost"}
              >
                <Link href={`/dashboard/categories/documents?page=${page}`}>
                  {page}
                </Link>
              </Button>
            );
          })}

          <Button
            asChild
            className={cn(
              categories.page >= categories.totalPages &&
                "pointer-events-none opacity-50"
            )}
            size="sm"
            variant="ghost"
          >
            <Link
              aria-disabled={categories.page >= categories.totalPages}
              href={`/dashboard/categories/documents?page=${Math.min(
                categories.page + 1,
                categories.totalPages
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
