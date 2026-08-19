"use server";

import {
  createSupabaseAdminClient,
  createSupabaseServerClient
} from "@/lib/supabase/server";
import { normalizeLocale } from "@/lib/i18n/dictionaries";

export type InquiryFormState = {
  message: string;
  ok: boolean;
};

const INQUIRY_BUCKET = "TEST";
const MAX_QUOTE_FILE_SIZE_BYTES = 20 * 1024 * 1024;
const ALLOWED_QUOTE_FILE_EXTENSIONS = new Set([
  "csv",
  "dwg",
  "dxf",
  "jpeg",
  "jpg",
  "pdf",
  "png"
]);

function getFileExtension(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() || "file";
}

function sanitizeFileName(fileName: string) {
  return fileName
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export async function submitInquiry(
  _previousState: InquiryFormState,
  formData: FormData
): Promise<InquiryFormState> {
  const supabase = createSupabaseAdminClient() ?? createSupabaseServerClient();
  const locale = normalizeLocale(String(formData.get("locale") ?? ""));
  const messages = {
    en: {
      fileTooLarge: "The uploaded file cannot exceed 20MB.",
      invalidFileType:
        "Unsupported file type. Please upload csv, pdf, dwg, dxf, jpg, or png files.",
      missingFields: "Please fill in name, phone, email, and inquiry details.",
      missingQuoteColumn:
        "The quote file was uploaded, but the inquiries table is missing the quote_file_url field.",
      serviceUnavailable: "Inquiry service is temporarily unavailable.",
      submitFailed:
        "Form submission failed. Please try again later, or contact us by phone or email if the issue continues.",
      success: "Submitted successfully. We will contact you soon.",
      uploadFailed:
        "Quote file upload failed. Please try again later, or submit the form without the file first."
    },
    zh: {
      fileTooLarge: "上传文件不能超过 20MB",
      invalidFileType: "上传文件格式不支持，请上传 csv、pdf、dwg、dxf、jpg 或 png 文件",
      missingFields: "请填写姓名、电话、邮箱和具体信息",
      missingQuoteColumn: "询价单已上传，但 inquiries 表缺少 quote_file_url 字段",
      serviceUnavailable: "询价服务暂时不可用",
      submitFailed: "表单提交失败，请稍后重试；如果问题持续存在，请直接电话或邮件联系",
      success: "提交成功，我们会尽快与您联系",
      uploadFailed: "询价单上传失败，请稍后重试；如仍失败，可以先不上传文件提交表单"
    }
  }[locale];

  if (!supabase) {
    return {
      message: messages.serviceUnavailable,
      ok: false
    };
  }

  const name = String(formData.get("name") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const productId = String(formData.get("productId") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const quoteFile = formData.get("quoteFile");

  if (!name || !phone || !email || !message) {
    return {
      message: messages.missingFields,
      ok: false
    };
  }

  let quoteFileUrl: string | null = null;

  if (quoteFile instanceof File && quoteFile.size > 0) {
    if (quoteFile.size > MAX_QUOTE_FILE_SIZE_BYTES) {
      return {
        message: messages.fileTooLarge,
        ok: false
      };
    }

    const extension = getFileExtension(quoteFile.name);

    if (!ALLOWED_QUOTE_FILE_EXTENSIONS.has(extension)) {
      return {
        message: messages.invalidFileType,
        ok: false
      };
    }

    const safeName = sanitizeFileName(quoteFile.name) || `quote.${extension}`;
    const objectPath = `inquiry-uploads/${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from(INQUIRY_BUCKET)
      .upload(objectPath, quoteFile, {
        contentType: quoteFile.type || "application/octet-stream",
        upsert: false
      });

    if (uploadError) {
      console.error("Failed to upload inquiry quote file", uploadError);

      return {
        message: messages.uploadFailed,
        ok: false
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from(INQUIRY_BUCKET)
      .getPublicUrl(objectPath);

    quoteFileUrl = publicUrlData.publicUrl;
  }

  const numericProductId = Number(productId);
  const inquiryPayload: {
    company: string | null;
    email: string;
    message: string;
    name: string;
    phone: string;
    product_id: number | null;
    quote_file_url?: string;
    status: "new";
  } = {
    company: company || null,
    email,
    message,
    name,
    phone,
    product_id: Number.isFinite(numericProductId) ? numericProductId : null,
    status: "new"
  };

  if (quoteFileUrl) {
    inquiryPayload.quote_file_url = quoteFileUrl;
  }

  const { error } = await supabase.from("inquiries").insert(inquiryPayload);

  if (error) {
    console.error("Failed to submit inquiry", error);

    if (
      quoteFileUrl &&
      (error.message.includes("quote_file_url") ||
        error.message.includes("schema cache"))
    ) {
      return {
        message: messages.missingQuoteColumn,
        ok: false
      };
    }

    return {
      message: messages.submitFailed,
      ok: false
    };
  }

  return {
    message: messages.success,
    ok: true
  };
}
