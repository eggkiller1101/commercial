"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useCart } from "@/features/quote-cart/cart-context";
import { t, type Locale } from "@/lib/i18n/dictionary";

export function HeaderSearch({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");

  return (
    <form
      className="hidden h-9 w-56 shrink items-center gap-2 rounded-full border border-border bg-muted px-3 transition-colors focus-within:border-primary-400 sm:flex"
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = keyword.trim();
        router.push(trimmed ? `/products?q=${encodeURIComponent(trimmed)}` : "/products");
      }}
      role="search"
    >
      <span className="text-sm text-muted-foreground" aria-hidden>
        🔍
      </span>
      <input
        className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        onChange={(event) => setKeyword(event.target.value)}
        placeholder={t(locale, "header.searchPlaceholder")}
        type="search"
        value={keyword}
      />
    </form>
  );
}

export function HeaderCartButton({ locale }: { locale: Locale }) {
  const { count, hasHydrated } = useCart();

  return (
    <Link
      className="relative inline-flex h-[34px] shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-600"
      href="/quote-cart"
    >
      {t(locale, "header.cartBtn")}
      {hasHydrated && count > 0 ? (
        <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-card bg-secondary px-1 text-[11px] font-bold text-secondary-foreground">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
