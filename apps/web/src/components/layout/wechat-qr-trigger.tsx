"use client";

import Image from "next/image";
import { useState } from "react";

export function WechatQrTrigger({
  className = "text-foreground hover:text-primary-600",
  label
}: {
  className?: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className={`text-right underline decoration-dotted underline-offset-4 ${className}`}
        onClick={() => setOpen(true)}
        type="button"
      >
        {label}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            className="relative rounded-md bg-card p-6 text-center shadow-lg"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="微信二维码"
          >
            <button
              aria-label="关闭"
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              onClick={() => setOpen(false)}
              type="button"
            >
              ✕
            </button>
            <Image
              alt="微信二维码（示例）"
              className="mx-auto"
              height={200}
              src="/icons/wechat-qr-sample.png"
              width={200}
            />
            <p className="mt-3 text-sm text-muted-foreground">扫码添加工程师微信（示例）</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
