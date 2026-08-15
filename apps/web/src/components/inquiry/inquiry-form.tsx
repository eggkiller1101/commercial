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
    <form
      action={formAction}
      className="space-y-5 rounded-lg border border-border bg-card p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="name" placeholder="姓名 *" required />
        <Input name="company" placeholder="公司名称" />
        <Input name="phone" placeholder="联系电话 *" required />
        <Input name="email" placeholder="邮箱 *" required type="email" />
      </div>
      <Textarea name="message" placeholder="具体需求（项目背景、产品类型、工期要求等）" required />
      {state.message ? (
        <p
          className={
            state.ok ? "text-sm text-primary-600" : "text-sm text-destructive"
          }
        >
          {state.message}
        </p>
      ) : null}
      <Button className="w-full" disabled={isPending} type="submit">
        {isPending ? "提交中" : "提交询价"}
      </Button>
    </form>
  );
}
