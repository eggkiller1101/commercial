import Link from "next/link";
import { ChevronLeft, ChevronRight, Download, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getDocuments } from "@/features/documents/data";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

type DocumentsPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function DocumentsPage({
  searchParams
}: DocumentsPageProps) {
  const params = await searchParams;
  const requestedPage = Number.parseInt(params.page ?? "1", 10) || 1;
  const documents = await getDocuments({
    page: requestedPage,
    pageSize: PAGE_SIZE
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">资料列表</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          共 {documents.total} 条资料，每页显示 {documents.pageSize} 条。
        </p>
      </div>

      <div className="overflow-hidden rounded-md border bg-card">
        <table className="w-full table-fixed border-collapse text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="h-11 px-4 text-left font-medium">资料名</th>
              <th className="h-11 w-44 px-4 text-left font-medium">资料分类</th>
              <th className="h-11 w-56 px-4 text-left font-medium">上传时间</th>
              <th className="h-11 w-52 px-4 text-left font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {documents.items.length ? (
              documents.items.map((document) => (
                <tr className="border-t" key={document.id}>
                  <td
                    className="h-12 truncate px-4 font-medium"
                    title={document.name}
                  >
                    {document.name}
                  </td>
                  <td
                    className="h-12 truncate px-4 text-muted-foreground"
                    title={document.categoryName}
                  >
                    {document.categoryName}
                  </td>
                  <td className="h-12 px-4 text-muted-foreground">
                    {document.uploadedAt}
                  </td>
                  <td className="h-12 px-4">
                    <div className="flex items-center gap-2">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/dashboard/documents/${document.id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          编辑
                        </Link>
                      </Button>
                      <Button
                        asChild={Boolean(document.fileUrl)}
                        disabled={!document.fileUrl}
                        size="sm"
                        variant="ghost"
                      >
                        {document.fileUrl ? (
                          <a
                            href={document.fileUrl}
                            rel="noopener"
                            target="_blank"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            下载
                          </a>
                        ) : (
                          <span>
                            <Download className="mr-2 h-4 w-4" />
                            下载
                          </span>
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="border-t">
                <td
                  className="h-32 px-4 text-center text-sm text-muted-foreground"
                  colSpan={4}
                >
                  暂无资料数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          第 {documents.page} 页 / 共 {documents.totalPages} 页
        </p>

        <div className="flex items-center gap-2">
          <Button
            asChild
            className={cn(
              documents.page <= 1 && "pointer-events-none opacity-50"
            )}
            size="sm"
            variant="ghost"
          >
            <Link
              aria-disabled={documents.page <= 1}
              href={`/dashboard/documents?page=${Math.max(
                documents.page - 1,
                1
              )}`}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              上一页
            </Link>
          </Button>

          {Array.from({ length: documents.totalPages }, (_, index) => {
            const page = index + 1;

            return (
              <Button
                asChild
                className="w-9 px-0"
                key={page}
                size="sm"
                variant={page === documents.page ? "default" : "ghost"}
              >
                <Link href={`/dashboard/documents?page=${page}`}>{page}</Link>
              </Button>
            );
          })}

          <Button
            asChild
            className={cn(
              documents.page >= documents.totalPages &&
                "pointer-events-none opacity-50"
            )}
            size="sm"
            variant="ghost"
          >
            <Link
              aria-disabled={documents.page >= documents.totalPages}
              href={`/dashboard/documents?page=${Math.min(
                documents.page + 1,
                documents.totalPages
              )}`}
            >
              下一页
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
