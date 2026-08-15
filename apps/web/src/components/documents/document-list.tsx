"use client";

import Link from "next/link";
import { useState } from "react";

import type { DocumentItem } from "@/features/documents/data";
import { t, type Locale } from "@/lib/i18n/dictionary";
import { formatBytes } from "@/lib/utils";

/**
 * 跟 demo 静态站 resources-page.js 的"全部资料 / PDF 文档"筛选按钮一致：
 * 文档列表本来就已经在服务端一次性拉取好了，这里只是纯前端按 fileType 过滤，
 * 不需要额外发请求。
 */
export function DocumentList({ documents, locale }: { documents: DocumentItem[]; locale: Locale }) {
  const [filter, setFilter] = useState<"all" | "pdf">("all");

  const filtered =
    filter === "all"
      ? documents
      : documents.filter((document) => document.fileType.toLowerCase() === "pdf");

  return (
    <div>
      <div className="mb-6 flex gap-2">
        <button
          className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors ${
            filter === "all"
              ? "bg-primary text-primary-foreground"
              : "border border-border text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setFilter("all")}
          type="button"
        >
          {t(locale, "documents.filterAll")}
        </button>
        <button
          className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors ${
            filter === "pdf"
              ? "bg-primary text-primary-foreground"
              : "border border-border text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setFilter("pdf")}
          type="button"
        >
          {t(locale, "documents.filterPdf")}
        </button>
      </div>

      {filtered.length ? (
        <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
          {filtered.map((document) => (
            <li
              className="flex flex-wrap items-center justify-between gap-4 p-4"
              key={document.id}
            >
              <div className="flex items-center gap-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary-50 text-[11px] font-bold text-primary-700">
                  {(document.fileType || "FILE").toUpperCase()}
                </span>
                <div>
                  <div className="text-[14px] font-medium text-foreground">{document.title}</div>
                  <div className="mt-0.5 text-[12px] text-muted-foreground">
                    {[document.categoryName, document.productName, formatBytes(document.fileSizeBytes)]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                {document.productId ? (
                  <Link
                    className="flex h-9 items-center rounded-md border border-border px-3.5 text-[12.5px] font-semibold text-foreground hover:border-primary-500 hover:text-primary-600"
                    href={`/products/${document.productId}`}
                  >
                    {t(locale, "documents.viewProduct")}
                  </Link>
                ) : null}
                {document.fileUrl ? (
                  <a
                    className="flex h-9 items-center rounded-md border border-border px-3.5 text-[12.5px] font-semibold text-foreground hover:border-primary-500 hover:text-primary-600"
                    href={document.fileUrl}
                    rel="noopener"
                    target="_blank"
                  >
                    {t(locale, "documents.download")}
                  </a>
                ) : (
                  <span className="flex h-9 items-center text-[12.5px] text-muted-foreground">
                    {t(locale, "documents.noFile")}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-lg border border-border bg-card p-10 text-center text-sm text-muted-foreground">
          {t(locale, "documents.empty")}
        </div>
      )}
    </div>
  );
}
