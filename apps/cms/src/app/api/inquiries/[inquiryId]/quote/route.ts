import { NextResponse } from "next/server";

import { requireApiPermission } from "@/features/auth/guards";
import { getInquiryQuoteFile } from "@/features/inquiries/data";

type QuoteRouteContext = {
  params: Promise<{
    inquiryId: string;
  }>;
};

export async function GET(_request: Request, context: QuoteRouteContext) {
  const permission = await requireApiPermission("manage_inquiries");

  if (permission.response) {
    return permission.response;
  }

  const { inquiryId } = await context.params;
  const quote = await getInquiryQuoteFile(inquiryId);

  if (!quote) {
    return NextResponse.json({ message: "Inquiry not found" }, { status: 404 });
  }

  return new NextResponse(quote.content, {
    headers: {
      "Content-Disposition": `attachment; filename="${quote.filename}"`,
      "Content-Type": quote.contentType
    }
  });
}
