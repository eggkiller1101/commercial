import { CategoryForm } from "@/features/categories/category-form";

export default function NewCategoryPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold">一级分类新增</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          填写一级分类基础信息并保存到 categories 表。
        </p>
      </div>

      <CategoryForm />
    </div>
  );
}
