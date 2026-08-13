"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type InquiryFormState = {
  message: string;
  ok: boolean;
};

export async function submitInquiry(
  _previousState: InquiryFormState,
  formData: FormData
): Promise<InquiryFormState> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return {
      message: "询价服务暂时不可用",
      ok: false
    };
  }

  const name = String(formData.get("name") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const productId = String(formData.get("productId") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !phone || !email || !message) {
    return {
      message: "请填写姓名、电话、邮箱和具体信息",
      ok: false
    };
  }

  const numericProductId = Number(productId);
  const { error } = await supabase.from("inquiries").insert({
    company: company || null,
    email,
    message,
    name,
    phone,
    product_id: Number.isFinite(numericProductId) ? numericProductId : null,
    status: "new"
  });

  if (error) {
    console.error("Failed to submit inquiry", error);

    return {
      message: "询价提交失败，请稍后重试",
      ok: false
    };
  }

  return {
    message: "询价已提交",
    ok: true
  };
}
