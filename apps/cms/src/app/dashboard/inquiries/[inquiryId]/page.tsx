import { notFound } from "next/navigation";
import { FileSpreadsheet } from "lucide-react";

import { getInquiryById } from "@/features/inquiries/data";
import { QuoteDownloadButton } from "@/features/inquiries/quote-download-button";

type InquiryDetailPageProps = {
  params: Promise<{
    inquiryId: string;
  }>;
};

const detailFields = [
  ["客户名", "customerName"],
  ["客户公司", "customerCompany"],
  ["客户电话", "customerPhone"],
  ["邮箱", "email"],
  ["产品id", "productId"],
  ["具体信息", "message"]
] as const;

export default async function InquiryDetailPage({
  params
}: InquiryDetailPageProps) {
  const { inquiryId } = await params;
  const inquiry = await getInquiryById(inquiryId);

  if (!inquiry) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-xl font-semibold">询价详情</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          当前为用户上传的询价表单 mock 内容，后续会从数据库读取。
        </p>
      </div>

      <div className="space-y-5 rounded-md border bg-card p-6">
        <div className="grid grid-cols-2 gap-5">
          {detailFields.map(([label, key]) => (
            <div
              className={key === "message" ? "col-span-2" : undefined}
              key={key}
            >
              <p className="text-sm font-medium">{label}</p>
              <p className="mt-2 rounded-md border bg-background px-3 py-2 text-sm text-muted-foreground">
                {inquiry[key]}
              </p>
            </div>
          ))}
        </div>

        <div>
          <p className="text-sm font-medium">询价单</p>
          <div className="mt-2 flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-3 text-sm">
            <div className="flex min-w-0 items-center gap-3">
              <FileSpreadsheet className="h-5 w-5 shrink-0 text-muted-foreground" />
              <span className="truncate font-medium">{inquiry.quoteFile}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                csv格式
              </span>
            </div>

            <QuoteDownloadButton
              filename={inquiry.quoteFile}
              href={`/api/inquiries/${inquiry.id}/quote`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
