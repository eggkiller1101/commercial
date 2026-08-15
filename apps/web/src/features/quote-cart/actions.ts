"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { CartItem } from "./cart-context";

export type QuoteCartSubmitInput = {
  company: string;
  email: string;
  items: CartItem[];
  message: string;
  name: string;
  phone: string;
};

export type QuoteCartSubmitResult = {
  message: string;
  ok: boolean;
};

/**
 * 把询价清单打包提交:
 * 1. 先在 inquiries 插入一条"线索"(联系人信息 + 第一个产品作为主关联,
 *    兼容旧的单产品报表/后台视图)。
 * 2. 再把清单里每一项写进 inquiry_items(inquiry_id, product_id, 数量/备注),
 *    正规化存储多产品明细,不用像 demo 静态站那样把清单拼成文字塞进 message。
 *
 * 依赖 schema.sql 里新增的 inquiry_items 表 + policy.sql 里的
 * public_insert_inquiry_items 策略——这些需要你在 Supabase 后台手动执行一次
 * (这个会话里没有 service_role/DDL 权限,没法帮你直接建表)。
 */
export async function submitQuoteCart(
  input: QuoteCartSubmitInput
): Promise<QuoteCartSubmitResult> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return { message: "询价服务暂时不可用", ok: false };
  }

  const name = input.name.trim();
  const phone = input.phone.trim();
  const email = input.email.trim();
  const company = input.company.trim();
  const message = input.message.trim();

  if (!input.items.length) {
    return { message: "询价清单为空，请先添加产品", ok: false };
  }

  if (!name || !phone || !email) {
    return { message: "请填写姓名、联系电话和邮箱", ok: false };
  }

  const firstProductId = Number(input.items[0]?.productId);

  const { data: inquiry, error: inquiryError } = await supabase
    .from("inquiries")
    .insert({
      company: company || null,
      email,
      message: message || null,
      name,
      phone,
      product_id: Number.isFinite(firstProductId) ? firstProductId : null,
      status: "new"
    })
    .select("id")
    .single();

  if (inquiryError || !inquiry) {
    console.error("Failed to submit quote cart inquiry", inquiryError);
    return { message: "询价提交失败，请稍后重试", ok: false };
  }

  const itemRows = input.items.map((item) => {
    const numericProductId = Number(item.productId);

    return {
      inquiry_id: inquiry.id,
      model_number: item.modelNumber || null,
      note: item.note || null,
      product_id: Number.isFinite(numericProductId) ? numericProductId : null,
      product_name: item.name,
      quantity: item.quantity
    };
  });

  const { error: itemsError } = await supabase
    .from("inquiry_items")
    .insert(itemRows);

  if (itemsError) {
    console.error("Failed to submit quote cart items", itemsError);
    return {
      message: "询价已提交，但清单明细同步失败，工程师会根据联系方式与您核实",
      ok: true
    };
  }

  return { message: "询价已提交，工程师将在 1 个工作日内与您联系", ok: true };
}
