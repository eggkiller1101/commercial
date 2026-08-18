import { getCategoryOptions } from "@/features/categories/data";
import { SubcategoryForm } from "@/features/categories/subcategory-form";

export default async function NewSubcategoryPage() {
  const categoryOptions = await getCategoryOptions();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold">二级分类新增</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          选择所属一级分类，并保存到 subcategories 表。
        </p>
      </div>

      <SubcategoryForm categoryOptions={categoryOptions} />
    </div>
  );
}
