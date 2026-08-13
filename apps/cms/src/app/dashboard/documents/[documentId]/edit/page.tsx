import { notFound } from "next/navigation";

import { DocumentForm } from "@/features/documents/document-form";
import { getDocumentById } from "@/features/documents/data";

type EditDocumentPageProps = {
  params: Promise<{
    documentId: string;
  }>;
};

export default async function EditDocumentPage({
  params
}: EditDocumentPageProps) {
  const { documentId } = await params;
  const document = await getDocumentById(documentId);

  if (!document) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold">文件编辑</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          当前从 documents 表读取文件内容。
        </p>
      </div>

      <DocumentForm defaultValues={document} mode="edit" />
    </div>
  );
}
