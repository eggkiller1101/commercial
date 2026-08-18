import { notFound } from "next/navigation";

import { DocumentCategoryForm } from "@/features/categories/document-category-form";
import { getDocumentCategoryById } from "@/features/categories/data";

type EditDocumentCategoryPageProps = {
  params: Promise<{
    documentCategoryId: string;
  }>;
};

export default async function EditDocumentCategoryPage({
  params
}: EditDocumentCategoryPageProps) {
  const { documentCategoryId } = await params;
  const category = await getDocumentCategoryById(documentCategoryId);

  if (!category) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold">资料分类编辑</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          当前从 document_categories 表读取资料分类内容。
        </p>
      </div>

      <DocumentCategoryForm defaultValues={category} />
    </div>
  );
}
