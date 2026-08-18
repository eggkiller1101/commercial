import Link from "next/link";
import { Pencil, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getCategories, getSubcategories } from "@/features/categories/data";

const PAGE_SIZE = 20;

export default async function CategoriesPage() {
  const [categories, subcategories] = await Promise.all([
    getCategories({
      page: 1,
      pageSize: PAGE_SIZE
    }),
    getSubcategories({
      page: 1,
      pageSize: PAGE_SIZE
    })
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold">产品分类</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          统一管理产品一级分类和二级分类。产品新增/编辑页会先选择一级分类，再按一级分类筛选二级分类。
        </p>
      </div>

      <section className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold">一级分类</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              共 {categories.total} 条一级分类，当前显示前 {categories.items.length} 条。
            </p>
          </div>
          <Button asChild size="sm">
            <Link href="/dashboard/categories/new">
              <Plus className="mr-2 h-4 w-4" />
              新增一级分类
            </Link>
          </Button>
        </div>

        <div className="overflow-hidden rounded-md border bg-card">
          <table className="w-full table-fixed border-collapse text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="h-11 px-4 text-left font-medium">一级分类名</th>
                <th className="h-11 w-56 px-4 text-left font-medium">
                  创建时间
                </th>
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
                    <td className="h-12 px-4 text-muted-foreground">
                      {category.uploadedAt}
                    </td>
                    <td className="h-12 px-4">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/dashboard/categories/${category.id}/edit`}>
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
                    colSpan={3}
                  >
                    暂无一级分类数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold">二级分类</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              共 {subcategories.total} 条二级分类，当前显示前{" "}
              {subcategories.items.length} 条。
            </p>
          </div>
          <Button asChild size="sm">
            <Link href="/dashboard/categories/subcategories/new">
              <Plus className="mr-2 h-4 w-4" />
              新增二级分类
            </Link>
          </Button>
        </div>

        <div className="overflow-hidden rounded-md border bg-card">
          <table className="w-full table-fixed border-collapse text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="h-11 px-4 text-left font-medium">二级分类名</th>
                <th className="h-11 w-56 px-4 text-left font-medium">
                  所属一级分类
                </th>
                <th className="h-11 w-56 px-4 text-left font-medium">
                  创建时间
                </th>
                <th className="h-11 w-32 px-4 text-left font-medium">操作</th>
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
      </section>
    </div>
  );
}
