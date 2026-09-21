import Link from "next/link";
import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { getInquiries } from "@/features/inquiries/data";

const PAGE_SIZE = 20;

type InquiriesPageProps = {
  searchParams: Promise<{
    page?: string;
  }>;
};

export default async function InquiriesPage({
  searchParams
}: InquiriesPageProps) {
  const params = await searchParams;
  const requestedPage = Number.parseInt(params.page ?? "1", 10) || 1;
  const inquiries = await getInquiries({
    page: requestedPage,
    pageSize: PAGE_SIZE
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">询价列表</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          共 {inquiries.total} 条询价，每页显示 {inquiries.pageSize} 条。
        </p>
      </div>

      <div className="overflow-hidden rounded-md border bg-card">
        <table className="w-full table-fixed border-collapse text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th className="h-11 px-4 text-left font-medium">客户id</th>
              <th className="h-11 w-56 px-4 text-left font-medium">询价时间</th>
              <th className="h-11 w-32 px-4 text-left font-medium">详情按钮</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.items.length ? (
              inquiries.items.map((inquiry) => (
                <tr className="border-t" key={inquiry.id}>
                  <td
                    className="h-12 truncate px-4 font-medium"
                    title={inquiry.customerId}
                  >
                    {inquiry.customerId}
                  </td>
                  <td className="h-12 px-4 text-muted-foreground">
                    {inquiry.inquiryTime}
                  </td>
                  <td className="h-12 px-4">
                    <Button asChild size="sm" variant="ghost">
                      <Link href={`/dashboard/inquiries/${inquiry.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        详情
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="border-t">
                <td
                  className="h-32 px-4 text-center text-sm text-muted-foreground"
                  colSpan={3}
                >
                  暂无询价数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        basePath="/dashboard/inquiries"
        page={inquiries.page}
        totalPages={inquiries.totalPages}
      />
    </div>
  );
}
