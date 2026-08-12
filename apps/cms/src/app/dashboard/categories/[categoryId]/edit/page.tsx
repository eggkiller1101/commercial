import { notFound } from "next/navigation";

import { CategoryForm } from "@/features/categories/category-form";
import { getCategoryById } from "@/features/categories/data";

type EditCategoryPageProps = {
  params: Promise<{
    categoryId: string;
  }>;
};

export default async function EditCategoryPage({
  params
}: EditCategoryPageProps) {
  const { categoryId } = await params;
  const category = await getCategoryById(categoryId);

  if (!category) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold">分类编辑</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          当前从 categories 表读取分类内容。
        </p>
      </div>

      <CategoryForm defaultValues={category} />
    </div>
  );
}
