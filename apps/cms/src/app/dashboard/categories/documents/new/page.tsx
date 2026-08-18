import { DocumentCategoryForm } from "@/features/categories/document-category-form";

export default function NewDocumentCategoryPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold">资料分类新增</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          资料分类保存到 document_categories 表，用于资料新增和资料列表展示。
        </p>
      </div>

      <DocumentCategoryForm />
    </div>
  );
}
