"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitInquiry } from "@/features/inquiries/actions";

const initialState = {
  message: "",
  ok: false
};

export function InquiryForm() {
  const [state, formAction, isPending] = useActionState(
    submitInquiry,
    initialState
  );

  return (
    <form action={formAction} className="space-y-5 rounded-md border bg-card p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="name" placeholder="客户名" />
        <Input name="company" placeholder="客户公司" />
        <Input name="phone" placeholder="客户电话" />
        <Input name="email" placeholder="邮箱" type="email" />
      </div>
      <Input name="productId" placeholder="产品 id，可选" />
      <Textarea name="message" placeholder="具体信息" />
      <Input accept=".csv" name="quoteFile" type="file" />
      <p className="text-xs text-muted-foreground">
        文件上传存储尚未接入，当前表单先预留上传入口。
      </p>
      {state.message ? (
        <p
          className={
            state.ok ? "text-sm text-primary" : "text-sm text-destructive"
          }
        >
          {state.message}
        </p>
      ) : null}
      <Button disabled={isPending} type="submit">
        {isPending ? "提交中" : "提交询价"}
      </Button>
    </form>
  );
}
