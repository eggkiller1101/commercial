"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { useCart } from "@/features/quote-cart/cart-context";
import { submitQuoteCart } from "@/features/quote-cart/actions";

export function QuoteCartView() {
  const { clear, hasHydrated, items, removeItem, updateNote, updateQuantity } = useCart();
  const [form, setForm] = useState({ company: "", email: "", message: "", name: "", phone: "" });
  const [submitState, setSubmitState] = useState<{ message: string; ok: boolean } | null>(null);
  const [isPending, setIsPending] = useState(false);

  if (hasHydrated && !items.length && !submitState) {
    return (
      <div className="rounded-lg border border-border bg-card p-10 text-center">
        <p className="text-muted-foreground">询价清单为空</p>
        <Link
          className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary-600"
          href="/products"
        >
          去挑选产品 →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:items-start">
      <div className="space-y-3">
        {items.map((item) => (
          <div
            className="flex gap-4 rounded-lg border border-border bg-card p-4"
            key={item.productId}
          >
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md bg-neutral-100">
              <Image
                alt={item.name}
                height={56}
                src={item.imageUrl ?? "/icons/generic-product.svg"}
                width={56}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-primary-600">{item.modelNumber}</p>
              <p className="truncate font-medium">{item.name}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  数量
                  <input
                    className="h-8 w-16 rounded-md border border-input bg-background px-2 text-sm"
                    min={1}
                    onChange={(event) =>
                      updateQuantity(item.productId, Number(event.target.value))
                    }
                    type="number"
                    value={item.quantity}
                  />
                </label>
                <button
                  className="text-xs text-destructive hover:underline"
                  onClick={() => removeItem(item.productId)}
                  type="button"
                >
                  移除
                </button>
              </div>
              <input
                className="mt-2 h-8 w-full rounded-md border border-input bg-background px-2 text-xs"
                onChange={(event) => updateNote(item.productId, event.target.value)}
                placeholder="备注（可选，如规格 / 用途）"
                value={item.note}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="mb-4 text-base font-semibold">项目与联系人信息</h3>
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setIsPending(true);
            setSubmitState(null);
            const result = await submitQuoteCart({ ...form, items });
            setSubmitState(result);
            setIsPending(false);
            if (result.ok) {
              clear();
              setForm({ company: "", email: "", message: "", name: "", phone: "" });
            }
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            <input
              className="col-span-2 h-10 rounded-md border border-input bg-background px-3 text-sm sm:col-span-1"
              onChange={(event) => setForm((f) => ({ ...f, name: event.target.value }))}
              placeholder="姓名 *"
              required
              value={form.name}
            />
            <input
              className="col-span-2 h-10 rounded-md border border-input bg-background px-3 text-sm sm:col-span-1"
              onChange={(event) => setForm((f) => ({ ...f, company: event.target.value }))}
              placeholder="公司名称"
              value={form.company}
            />
            <input
              className="col-span-2 h-10 rounded-md border border-input bg-background px-3 text-sm sm:col-span-1"
              onChange={(event) => setForm((f) => ({ ...f, phone: event.target.value }))}
              placeholder="联系电话 *"
              required
              value={form.phone}
            />
            <input
              className="col-span-2 h-10 rounded-md border border-input bg-background px-3 text-sm sm:col-span-1"
              onChange={(event) => setForm((f) => ({ ...f, email: event.target.value }))}
              placeholder="邮箱 *"
              required
              type="email"
              value={form.email}
            />
          </div>
          <textarea
            className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            onChange={(event) => setForm((f) => ({ ...f, message: event.target.value }))}
            placeholder="补充说明（项目所在地、工期要求等）"
            value={form.message}
          />
          <button
            className="flex h-10 w-full items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary-600 disabled:opacity-50"
            disabled={isPending || !items.length}
            type="submit"
          >
            {isPending ? "提交中" : "提交询价清单"}
          </button>
          {submitState ? (
            <p className={submitState.ok ? "text-sm text-primary-600" : "text-sm text-destructive"}>
              {submitState.message}
            </p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
