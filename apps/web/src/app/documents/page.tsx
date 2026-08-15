import { PageHero } from "@/components/layout/page-hero";
import { getPublishedDocuments } from "@/features/documents/data";

export default async function DocumentsPage() {
  const documents = await getPublishedDocuments();

  return (
    <div>
      <PageHero
        description="产品说明书、安装指南与认证证书下载，资料随产品数据自动同步更新。"
        eyebrow="资料中心"
        title="资料下载"
      />

      <div className="mx-auto max-w-site px-4 py-10">
        <div className="overflow-hidden rounded-lg border border-border bg-card">
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
                  <tr className="border-t border-border" key={document.id}>
                    <td className="h-12 px-4 font-medium">{document.title}</td>
                    <td className="h-12 px-4 text-muted-foreground">{document.fileType}</td>
                    <td className="h-12 px-4 text-muted-foreground">{document.language}</td>
                    <td className="h-12 px-4">
                      {document.fileUrl ? (
                        <a className="text-primary-600 hover:underline" href={document.fileUrl}>
                          下载
                        </a>
                      ) : (
                        <span className="text-muted-foreground">暂无文件</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-t border-border">
                  <td className="h-32 px-4 text-center text-muted-foreground" colSpan={4}>
                    暂无资料文件
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
