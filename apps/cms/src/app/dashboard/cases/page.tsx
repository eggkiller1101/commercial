import Link from "next/link";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { getCases } from "@/features/cases/data";
import { CaseStatusButton } from "@/features/cases/case-status-button";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

type CasesPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function CasesPage({ searchParams }: CasesPageProps) {
  const params = await searchParams;
  const requestedPage = Number.parseInt(params.page ?? "1", 10) || 1;
  const cases = await getCases({
    page: requestedPage,
    pageSize: PAGE_SIZE
  });

  function getCaseStatusLabel(status: string) {
    if (status === "published") {
      return "已上架";
    }

    if (status === "archived") {
      return "已下架";
    }

    return "草稿";
  }

  function getCaseStatusClassName(status: string) {
    if (status === "published") {
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }

    if (status === "archived") {
      return "border-slate-200 bg-slate-50 text-slate-600";
    }

    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">案例列表</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          共 {cases.total} 条案例，每页显示 {cases.pageSize} 条。
        </p>
      </div>

      <div className="overflow-hidden rounded-md border bg-card">
        <table className="w-full table-fixed border-collapse text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="h-11 px-4 text-left font-medium">案例标题</th>
              <th className="h-11 w-56 px-4 text-left font-medium">上传时间</th>
              <th className="h-11 w-72 px-4 text-left font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {cases.items.length ? (
              cases.items.map((caseItem) => (
                <tr className="border-t" key={caseItem.id}>
                  <td
                    className="h-12 truncate px-4 font-medium"
                    title={caseItem.title}
                  >
                    {caseItem.title}
                  </td>
                  <td className="h-12 px-4 text-muted-foreground">
                    {caseItem.uploadedAt}
                  </td>
                  <td className="h-12 px-4">
                    <div className="flex items-center gap-2">
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/dashboard/cases/${caseItem.id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          编辑
                        </Link>
                      </Button>
                      <CaseStatusButton
                        caseId={caseItem.id}
                        status={caseItem.status}
                      />
                      <span
                        className={cn(
                          "inline-flex h-7 items-center rounded-full border px-2.5 text-xs font-medium",
                          getCaseStatusClassName(caseItem.status)
                        )}
                      >
                        {getCaseStatusLabel(caseItem.status)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="border-t">
                <td
                  className="h-32 px-4 text-center text-sm text-muted-foreground"
                  colSpan={3}
                >
                  暂无案例数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        basePath="/dashboard/cases"
        page={cases.page}
        totalPages={cases.totalPages}
      />
    </div>
  );
}
