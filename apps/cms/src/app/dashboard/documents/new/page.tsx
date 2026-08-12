import { DocumentForm } from "@/features/documents/document-form";

export default function NewDocumentPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold">文件新增</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          填写文件基础信息并保存到 documents 表。
        </p>
      </div>

      <DocumentForm />
    </div>
  );
}
