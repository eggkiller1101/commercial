"use client";

import { useEffect, useState } from "react";

/**
 * 微信二维码弹窗触发器：页脚"微信咨询"和联系我们页"扫码添加工程师"两处复用
 * 同一个组件、同一张二维码图片，点击后弹出放大的二维码，避免维护两份重复逻辑。
 *
 * 当前二维码图片（/assets/wechat-qr-placeholder.svg）是占位用的假二维码，
 * 等真实的企业微信/个人微信二维码图片准备好后，直接替换那张图片文件即可，
 * 不需要改这里的代码。
 */
export function WechatQrTrigger({
  as = "span",
  caption,
  className,
  closeLabel,
  qrImageAlt,
  triggerLabel
}: {
  as?: "span" | "button";
  caption: string;
  className?: string;
  closeLabel: string;
  qrImageAlt: string;
  triggerLabel: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const Trigger = as === "button" ? "button" : "span";

  return (
    <>
      <Trigger
        aria-haspopup="dialog"
        className={`wechat-qr-trigger${className ? ` ${className}` : ""}`}
        onClick={() => setOpen(true)}
        {...(as === "button" ? { type: "button" as const } : { role: "button", tabIndex: 0 })}
      >
        {triggerLabel}
      </Trigger>

      {open ? (
        <div
          aria-modal="true"
          className="qr-modal-overlay"
          onClick={() => setOpen(false)}
          role="dialog"
        >
          <div className="qr-modal-card" onClick={(event) => event.stopPropagation()}>
            <button
              aria-label={closeLabel}
              className="qr-modal-close"
              onClick={() => setOpen(false)}
              type="button"
            >
              ✕
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt={qrImageAlt} className="qr-modal-image" src="/assets/wechat-qr-placeholder.svg" />
            <p className="qr-modal-caption">{caption}</p>
          </div>
        </div>
      ) : null}
    </>
  );
}
