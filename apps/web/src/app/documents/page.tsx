import { getPublishedDocuments } from "@/features/documents/data";

export default async function DocumentsPage() {
  const documents = await getPublishedDocuments();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">资料下载</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          读取已发布文件。文件存储接入前不会使用 mock 下载地址。
        </p>
      </div>

      <div className="overflow-hidden rounded-md border bg-card">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="h-11 px-4 text-left font-medium">文件名</th>
              <th className="h-11 w-32 px-4 text-left font-medium">类型</th>
              <th className="h-11 w-32 px-4 text-left font-medium">语言</th>
              <th className="h-11 w-32 px-4 text-left font-medium">下载</th>
            </tr>
          </thead>
          <tbody>
            {documents.length ? (
              documents.map((document) => (
                <tr className="border-t" key={document.id}>
                  <td className="h-12 px-4 font-medium">{document.title}</td>
                  <td className="h-12 px-4 text-muted-foreground">
                    {document.fileType}
                  </td>
                  <td className="h-12 px-4 text-muted-foreground">
                    {document.language}
                  </td>
                  <td className="h-12 px-4">
                    {document.fileUrl ? (
                      <a
                        className="text-primary hover:underline"
                        href={document.fileUrl}
                      >
                        下载
                      </a>
                    ) : (
                      <span className="text-muted-foreground">暂无文件</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr className="border-t">
                <td
                  className="h-32 px-4 text-center text-muted-foreground"
                  colSpan={4}
                >
                  暂无资料文件
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
