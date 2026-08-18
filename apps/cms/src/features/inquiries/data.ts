import { createSupabaseServerClient } from "@/lib/supabase/server";

export type InquiryDetail = {
  customerCompany: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  email: string;
  id: string;
  inquiryTime: string;
  message: string;
  productId: string;
  quoteFile: string | null;
  quoteFileUrl: string | null;
};

export type InquiryListItem = Pick<
  InquiryDetail,
  "id" | "customerId" | "inquiryTime"
>;

export type PaginatedInquiries = {
  items: InquiryListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

const formatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit"
});

function formatDate(value: string | null) {
  if (!value) {
    return "";
  }

  return formatter.format(new Date(value));
}

function mapInquiryDetail(
  inquiry: {
    id: number;
    name: string;
    company: string | null;
    phone: string | null;
    email: string | null;
    product_id: number | null;
    message: string | null;
    quote_file_url: string | null;
    created_at: string;
  }
): InquiryDetail {
  const customerId = `CUST-${String(inquiry.id).padStart(3, "0")}`;

  return {
    id: String(inquiry.id),
    customerId,
    inquiryTime: formatDate(inquiry.created_at),
    customerName: inquiry.name,
    customerCompany: inquiry.company ?? "",
    customerPhone: inquiry.phone ?? "",
    email: inquiry.email ?? "",
    productId: inquiry.product_id ? String(inquiry.product_id) : "",
    message: inquiry.message ?? "",
    quoteFile: inquiry.quote_file_url
      ? decodeURIComponent(
          inquiry.quote_file_url.split("/").pop() ?? "inquiry-quote-file"
        )
      : null,
    quoteFileUrl: inquiry.quote_file_url
  };
}

export async function getInquiries(params: {
  page: number;
  pageSize: number;
}): Promise<PaginatedInquiries> {
  const supabase = createSupabaseServerClient();

  if (supabase) {
    const requestedPage = Math.max(params.page, 1);
    const from = (requestedPage - 1) * params.pageSize;
    const to = from + params.pageSize - 1;
    const { count, data, error } = await supabase
      .from("inquiries")
      .select("id,created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (!error && data) {
      const total = count ?? data.length;
      const totalPages = Math.max(Math.ceil(total / params.pageSize), 1);
      const page = Math.min(requestedPage, totalPages);

      return {
        items: data.map((inquiry) => ({
          id: String(inquiry.id),
          customerId: `CUST-${String(inquiry.id).padStart(3, "0")}`,
          inquiryTime: formatDate(inquiry.created_at)
        })),
        page,
        pageSize: params.pageSize,
        total,
        totalPages
      };
    }

    console.error("Failed to load inquiries from Supabase", error);
  }

  return {
    items: [],
    page: 1,
    pageSize: params.pageSize,
    total: 0,
    totalPages: 1
  };
}

export async function getInquiryById(
  inquiryId: string
): Promise<InquiryDetail | null> {
  const supabase = createSupabaseServerClient();

  if (supabase) {
    const numericId = Number(inquiryId);

    if (Number.isFinite(numericId)) {
      const { data, error } = await supabase
        .from("inquiries")
        .select(
          "id,name,company,phone,email,product_id,message,quote_file_url,created_at"
        )
        .eq("id", numericId)
        .maybeSingle();

      if (!error && data) {
        return mapInquiryDetail(data);
      }

      if (error) {
        console.error("Failed to load inquiry from Supabase", error);
      }
    }
  }

  return null;
}

export async function getInquiryQuoteFile(inquiryId: string): Promise<{
  content: ArrayBuffer;
  contentType: string;
  filename: string;
} | null> {
  const inquiry = await getInquiryById(inquiryId);

  if (!inquiry?.quoteFile || !inquiry.quoteFileUrl) {
    return null;
  }

  const response = await fetch(inquiry.quoteFileUrl);

  if (!response.ok) {
    return null;
  }

  return {
    content: await response.arrayBuffer(),
    contentType:
      response.headers.get("content-type") || "application/octet-stream",
    filename: inquiry.quoteFile
  };
}
