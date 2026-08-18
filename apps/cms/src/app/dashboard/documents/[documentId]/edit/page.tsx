import { notFound } from "next/navigation";

import { DocumentForm } from "@/features/documents/document-form";
import {
  getDocumentById,
  getDocumentFormOptions
} from "@/features/documents/data";

type EditDocumentPageProps = {
  params: Promise<{
    documentId: string;
  }>;
};

export default async function EditDocumentPage({
  params
}: EditDocumentPageProps) {
  const { documentId } = await params;
  const [document, options] = await Promise.all([
    getDocumentById(documentId),
    getDocumentFormOptions()
  ]);

  if (!document) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold">资料编辑</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          当前从 documents 表读取资料内容。
        </p>
      </div>

      <DocumentForm defaultValues={document} mode="edit" options={options} />
    </div>
  );
}
