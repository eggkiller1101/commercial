import { DocumentForm } from "@/features/documents/document-form";
import { getDocumentFormOptions } from "@/features/documents/data";

export default async function NewDocumentPage() {
  const options = await getDocumentFormOptions();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold">资料新增</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          上传资料并填写基础信息。资料存储接入后会保存到 documents 表。
        </p>
      </div>

      <DocumentForm options={options} />
    </div>
  );
}
