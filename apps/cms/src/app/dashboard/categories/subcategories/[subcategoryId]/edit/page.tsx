import { notFound } from "next/navigation";

import {
  getCategoryOptions,
  getSubcategoryById
} from "@/features/categories/data";
import { SubcategoryForm } from "@/features/categories/subcategory-form";

type EditSubcategoryPageProps = {
  params: Promise<{
    subcategoryId: string;
  }>;
};

export default async function EditSubcategoryPage({
  params
}: EditSubcategoryPageProps) {
  const { subcategoryId } = await params;
  const [categoryOptions, subcategory] = await Promise.all([
    getCategoryOptions(),
    getSubcategoryById(subcategoryId)
  ]);

  if (!subcategory) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold">二级分类编辑</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          当前从 subcategories 表读取二级分类内容。
        </p>
      </div>

      <SubcategoryForm
        categoryOptions={categoryOptions}
        defaultValues={subcategory}
      />
    </div>
  );
}
