"use client";

import { useActionState } from "react";

import { submitInquiry } from "@/features/inquiries/actions";

const initialState = {
  message: "",
  ok: false
};

export function InquiryForm({
  defaultMessage,
  productId,
  submitLabel = "提交询价"
}: {
  defaultMessage?: string;
  productId?: string;
  submitLabel?: string;
}) {
  const [state, formAction, isPending] = useActionState(
    submitInquiry,
    initialState
  );

  return (
    <div className="inquiry-card">
      <form action={formAction}>
        <div className="form-grid-2">
          <div className="form-row">
            <label>
              姓名 <span className="required">*</span>
            </label>
            <input name="name" placeholder="请输入您的姓名" type="text" />
          </div>
          <div className="form-row">
            <label>公司名称</label>
            <input name="company" placeholder="请输入公司名称" type="text" />
          </div>
        </div>

        <div className="form-grid-2">
          <div className="form-row">
            <label>
              联系电话 <span className="required">*</span>
            </label>
            <input name="phone" placeholder="请输入手机号 / 座机号" type="tel" />
          </div>
          <div className="form-row">
            <label>
              邮箱 <span className="required">*</span>
            </label>
            <input name="email" placeholder="用于接收报价邮件" type="email" />
          </div>
        </div>

        <input name="productId" type="hidden" value={productId ?? ""} />

        <div className="form-row">
          <label>询价内容</label>
          <textarea
            defaultValue={defaultMessage ?? ""}
            name="message"
            placeholder="请描述管径、数量、项目场景等信息，方便我们更准确报价"
            rows={4}
          />
        </div>

        <div className="form-row">
          <label>上传图纸 / 询价单</label>
          <input
            accept=".csv,.pdf,.dwg,.dxf,.jpg,.jpeg,.png"
            name="quoteFile"
            type="file"
          />
          <p className="text-muted" style={{ fontSize: 12, marginTop: 6 }}>
            文件上传存储尚未接入，当前先保留上传入口；提交会先写入表单文字内容。
          </p>
        </div>

        <button className="btn btn-primary btn-block" disabled={isPending} type="submit">
          {isPending ? "提交中" : submitLabel}
        </button>

        {state.message ? (
          <div className={`form-feedback ${state.ok ? "is-success" : "is-error"}`}>
            {state.message}
          </div>
        ) : null}
      </form>
    </div>
  );
}
