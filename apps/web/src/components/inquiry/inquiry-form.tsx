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
        <label className="block text-[13px]">
          <span className="mb-1.5 block font-medium text-foreground">
            姓名 <span className="text-destructive">*</span>
          </span>
          <Input name="name" placeholder="请输入您的姓名" required />
        </label>
        <label className="block text-[13px]">
          <span className="mb-1.5 block font-medium text-foreground">公司名称</span>
          <Input name="company" placeholder="请输入公司名称" />
        </label>
        <label className="block text-[13px]">
          <span className="mb-1.5 block font-medium text-foreground">
            联系电话 <span className="text-destructive">*</span>
          </span>
          <Input name="phone" placeholder="请输入手机号 / 座机号" required />
        </label>
        <label className="block text-[13px]">
          <span className="mb-1.5 block font-medium text-foreground">
            邮箱 <span className="text-destructive">*</span>
          </span>
          <Input name="email" placeholder="用于接收报价邮件" required type="email" />
        </label>
      </div>
      <label className="block text-[13px]">
        <span className="mb-1.5 block font-medium text-foreground">咨询内容</span>
        <Textarea name="message" placeholder="请描述项目背景、产品需求、工期要求等信息" required />
      </label>
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
