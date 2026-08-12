import { NextResponse } from "next/server";

import { getInquiryQuoteCsv } from "@/features/inquiries/data";

type QuoteRouteContext = {
  params: Promise<{
    inquiryId: string;
  }>;
};

export async function GET(_request: Request, context: QuoteRouteContext) {
  const { inquiryId } = await context.params;
  const quote = await getInquiryQuoteCsv(inquiryId);

  if (!quote) {
    return NextResponse.json({ message: "Inquiry not found" }, { status: 404 });
  }

  return new NextResponse(quote.csv, {
    headers: {
      "Content-Disposition": `attachment; filename="${quote.filename}"`,
      "Content-Type": "text/csv; charset=utf-8"
    }
  });
}
