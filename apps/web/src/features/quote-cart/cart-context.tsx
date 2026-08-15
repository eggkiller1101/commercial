"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

// ----------------------------------------------------------------------------
// 询价清单（购物车）—— 移植自 demo 静态站 prototype/js/quote-cart.js 的思路：
// 用 localStorage 跨页面记住用户选了哪些产品，直到他填完表单一次性提交询价。
// 真实数据库这边（见 inquiry_items 建表说明 / schema.sql）已经加了
// inquiry_items 关联表，所以这里不用再像 demo 那样把清单文字拼进 message 字段，
// 提交时会把每个 cart item 写成 inquiry_items 里的一行，正规化存储。
// ----------------------------------------------------------------------------

export type CartItem = {
  categoryName: string;
  imageUrl: string | null;
  modelNumber: string;
  name: string;
  note: string;
  productId: string;
  quantity: number;
};

type AddableProduct = {
  categoryName?: string;
  id: string;
  imageUrl?: string | null;
  modelNumber: string;
  name: string;
};

type CartContextValue = {
  addItem: (product: AddableProduct, quantity?: number) => void;
  clear: () => void;
  count: number;
  hasHydrated: boolean;
  items: CartItem[];
  removeItem: (productId: string) => void;
  updateNote: (productId: string, note: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
};

const STORAGE_KEY = "commercial_web_quote_cart_v1";

const CartContext = createContext<CartContextValue | null>(null);

function readStoredItems(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn("[QuoteCart] Failed to read cart from localStorage", error);
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setItems(readStoredItems());
    setHasHydrated(true);

    function handleStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) {
        setItems(readStoredItems());
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const persist = useCallback((next: CartItem[]) => {
    setItems(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const addItem = useCallback(
    (product: AddableProduct, quantity = 1) => {
      setItems((current) => {
        const existing = current.find((item) => item.productId === product.id);
        const next = existing
          ? current.map((item) =>
              item.productId === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          : [
              ...current,
              {
                categoryName: product.categoryName ?? "",
                imageUrl: product.imageUrl ?? null,
                modelNumber: product.modelNumber,
                name: product.name,
                note: "",
                productId: product.id,
                quantity
              }
            ];
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const removeItem = useCallback(
    (productId: string) => {
      setItems((current) => {
        const next = current.filter((item) => item.productId !== productId);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      setItems((current) => {
        const next = current.map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(1, Math.round(quantity) || 1) }
            : item
        );
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const updateNote = useCallback(
    (productId: string, note: string) => {
      setItems((current) => {
        const next = current.map((item) =>
          item.productId === productId ? { ...item, note } : item
        );
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
    },
    []
  );

  const clear = useCallback(() => {
    persist([]);
  }, [persist]);

  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      addItem,
      clear,
      count,
      hasHydrated,
      items,
      removeItem,
      updateNote,
      updateQuantity
    }),
    [addItem, clear, count, hasHydrated, items, removeItem, updateNote, updateQuantity]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);

  if (!ctx) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return ctx;
}
