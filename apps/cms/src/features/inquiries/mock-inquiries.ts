export type InquiryDetail = {
  id: string;
  customerId: string;
  inquiryTime: string;
  customerName: string;
  customerCompany: string;
  customerPhone: string;
  email: string;
  productId: string;
  message: string;
  quoteFile: string;
};

const formatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit"
});

export const mockInquiries: InquiryDetail[] = Array.from(
  { length: 42 },
  (_, index) => {
    const id = String(index + 1);
    const customerNumber = String(index + 1).padStart(3, "0");
    const productNumber = String((index % 12) + 1).padStart(3, "0");

    return {
      id,
      customerId: `CUST-${customerNumber}`,
      inquiryTime: formatter.format(
        new Date(2026, 7, 10 - (index % 18), 10 + (index % 7), 15)
      ),
      customerName: `客户 ${customerNumber}`,
      customerCompany: `示例公司 ${customerNumber}`,
      customerPhone: `1380000${String(index + 1).padStart(4, "0")}`,
      email: `customer${customerNumber}@example.com`,
      productId: `CP-2026-${productNumber}`,
      message:
        "希望了解该产品的批量采购价格、交付周期、包装方式和售后支持，请尽快联系。",
      quoteFile: `inquiry-${customerNumber}.csv`
    };
  }
);

export const mockInquiryDetails = Object.fromEntries(
  mockInquiries.map((inquiry) => [inquiry.id, inquiry])
);

export function buildInquiryCsv(inquiry: InquiryDetail) {
  const rows = [
    ["客户id", inquiry.customerId],
    ["询价时间", inquiry.inquiryTime],
    ["客户名", inquiry.customerName],
    ["客户公司", inquiry.customerCompany],
    ["客户电话", inquiry.customerPhone],
    ["邮箱", inquiry.email],
    ["产品id", inquiry.productId],
    ["具体信息", inquiry.message]
  ];

  return rows
    .map((row) =>
      row
        .map((cell) => `"${cell.replaceAll('"', '""')}"`)
        .join(",")
    )
    .join("\n");
}
