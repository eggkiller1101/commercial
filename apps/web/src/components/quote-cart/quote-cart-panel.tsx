"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { InquiryForm } from "@/components/inquiry/inquiry-form";
import {
  defaultLocale,
  getDictionary,
  type Locale
} from "@/lib/i18n/dictionaries";

type CartItem = {
  id: string;
  modelNumber: string;
  name: string;
  quantity: number;
};

const storageKey = "cloudintel_quote_cart_v1";

function readCart(): CartItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  window.localStorage.setItem(storageKey, JSON.stringify(items));
}

export function QuoteCartPanel({
  locale = defaultLocale,
  productId
}: {
  locale?: Locale;
  productId?: string;
}) {
  const dictionary = getDictionary(locale);
  const t = dictionary.quoteCart;
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const current = readCart();

    if (productId && !current.some((item) => item.id === productId)) {
      current.push({
        id: productId,
        modelNumber: "",
        name: `${t.productId}${productId}`,
        quantity: 1
      });
      writeCart(current);
    }

    setItems(current);
  }, [productId, t.productId]);

  const message = useMemo(() => {
    if (!items.length) {
      return "";
    }

    return [
      t.inquiryList,
      ...items.map(
        (item) =>
          `- ${item.name}${item.modelNumber ? `（${item.modelNumber}）` : ""} x ${item.quantity}`
      )
    ].join("\n");
  }, [items, t.inquiryList]);

  function updateQuantity(id: string, quantity: number) {
    const next = items.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(quantity, 1) } : item
    );
    setItems(next);
    writeCart(next);
  }

  function removeItem(id: string) {
    const next = items.filter((item) => item.id !== id);
    setItems(next);
    writeCart(next);
  }

  return (
    <div
      id="cart-main-grid"
      style={{
        alignItems: "start",
        display: "grid",
        gap: 32,
        gridTemplateColumns: "1.5fr 1fr"
      }}
    >
      <div>
        <div className="inquiry-card" id="cart-list-card">
          {items.length ? (
            items.map((item) => (
              <div className="cart-line-item" key={item.id}>
                <div className="thumb">
                  <span>📦</span>
                </div>
                <div>
                  <h4>{item.name}</h4>
                  <p className="text-muted">{item.modelNumber || item.id}</p>
                </div>
                <input
                  min={1}
                  onChange={(event) =>
                    updateQuantity(item.id, Number(event.target.value))
                  }
                  type="number"
                  value={item.quantity}
                />
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => removeItem(item.id)}
                  type="button"
                >
                  {t.delete}
                </button>
              </div>
            ))
          ) : (
            <div className="cart-empty-state">
              <div className="icon">🧾</div>
              <p>{t.cartEmpty}</p>
            </div>
          )}
        </div>

        <div className="inquiry-card" style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: 15, marginBottom: 8 }}>
            {t.fileTitle}
          </h3>
          <p className="text-muted" style={{ fontSize: 13 }}>
            {t.fileDesc}
          </p>
        </div>
      </div>

      <div>
        <div>
          <h3 style={{ fontSize: 15, marginBottom: 16 }}>{t.formTitle}</h3>
          <InquiryForm
            defaultMessage={message}
            locale={locale}
            productId={items[0]?.id}
            submitLabel={t.submitLabel}
          />
        </div>

        <div
          className="inquiry-card"
          style={{
            background: "var(--primary-50)",
            borderColor: "var(--primary-100)",
            marginTop: 20
          }}
        >
          <p className="text-muted" style={{ fontSize: 12.5 }}>
            {t.contactQuestion}
          </p>
          <p style={{ marginTop: 8 }}>
            <Link className="btn btn-outline btn-sm" href="/contact">
              {t.contactText}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
