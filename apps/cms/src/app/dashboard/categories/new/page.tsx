import { CategoryForm } from "@/features/categories/category-form";

export default function NewCategoryPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold">分类新增</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          填写分类基础信息并保存到分类表。
        </p>
      </div>

      <CategoryForm />
    </div>
  );
}
