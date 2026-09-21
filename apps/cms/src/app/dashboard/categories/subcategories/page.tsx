import Link from "next/link";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { getSubcategories } from "@/features/categories/data";

const PAGE_SIZE = 20;

type SubcategoriesPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function SubcategoriesPage({
  searchParams
}: SubcategoriesPageProps) {
  const params = await searchParams;
  const requestedPage = Number.parseInt(params.page ?? "1", 10) || 1;
  const subcategories = await getSubcategories({
    page: requestedPage,
    pageSize: PAGE_SIZE
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">二级分类列表</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          共 {subcategories.total} 条二级分类，每页显示{" "}
          {subcategories.pageSize} 条。
        </p>
      </div>

      <div className="overflow-hidden rounded-md border bg-card">
        <table className="w-full table-fixed border-collapse text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="h-11 px-4 text-left font-medium">二级分类名</th>
              <th className="h-11 w-56 px-4 text-left font-medium">
                所属一级分类
              </th>
              <th className="h-11 w-56 px-4 text-left font-medium">创建时间</th>
              <th className="h-11 w-32 px-4 text-left font-medium">编辑按钮</th>
            </tr>
          </thead>
          <tbody>
            {subcategories.items.length ? (
              subcategories.items.map((subcategory) => (
                <tr className="border-t" key={subcategory.id}>
                  <td
                    className="h-12 truncate px-4 font-medium"
                    title={subcategory.name}
                  >
                    {subcategory.name}
                  </td>
                  <td
                    className="h-12 truncate px-4 text-muted-foreground"
                    title={subcategory.categoryName || "-"}
                  >
                    {subcategory.categoryName || "-"}
                  </td>
                  <td className="h-12 px-4 text-muted-foreground">
                    {subcategory.uploadedAt}
                  </td>
                  <td className="h-12 px-4">
                    <Button asChild size="sm" variant="ghost">
                      <Link
                        href={`/dashboard/categories/subcategories/${subcategory.id}/edit`}
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
                  暂无二级分类数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        basePath="/dashboard/categories/subcategories"
        page={subcategories.page}
        totalPages={subcategories.totalPages}
      />
    </div>
  );
}
