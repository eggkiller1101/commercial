"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { InquiryForm } from "@/components/inquiry/inquiry-form";

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

export function QuoteCartPanel({ productId }: { productId?: string }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const current = readCart();

    if (productId && !current.some((item) => item.id === productId)) {
      current.push({
        id: productId,
        modelNumber: "",
        name: `产品 ID：${productId}`,
        quantity: 1
      });
      writeCart(current);
    }

    setItems(current);
  }, [productId]);

  const message = useMemo(() => {
    if (!items.length) {
      return "";
    }

    return [
      "询价清单：",
      ...items.map(
        (item) =>
          `- ${item.name}${item.modelNumber ? `（${item.modelNumber}）` : ""} x ${item.quantity}`
      )
    ].join("\n");
  }, [items]);

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
                  删除
                </button>
              </div>
            ))
          ) : (
            <div className="cart-empty-state">
              <div className="icon">🧾</div>
              <p>询价清单为空，可以从产品详情页加入产品，也可以直接填写右侧表单。</p>
            </div>
          )}
        </div>

        <div className="inquiry-card" style={{ marginTop: 20 }}>
          <h3 style={{ fontSize: 15, marginBottom: 12 }}>
            图纸 / 清单上传（可选）
          </h3>
          <div className="upload-drop-zone">
            <strong>上传 BOQ 清单 / CAD 图纸 / PDF 技术文件</strong>
            这是原型演示，暂不支持真实文件上传与存储；正式上线后此处将接入文件存储服务。
            <div>
              <input
                disabled
                multiple
                title="原型演示，暂未开放真实上传"
                type="file"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <div>
          <h3 style={{ fontSize: 15, marginBottom: 16 }}>项目与联系人信息</h3>
          <InquiryForm
            defaultMessage={message}
            productId={items[0]?.id}
            submitLabel="提交询价清单"
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
            没有具体产品，只想咨询项目方案？
          </p>
          <p style={{ marginTop: 8 }}>
            <Link className="btn btn-outline btn-sm" href="/contact">
              前往联系我们页面 →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
