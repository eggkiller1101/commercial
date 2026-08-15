"use client";

import { useRouter } from "next/navigation";

import { t, type Locale } from "@/lib/i18n/dictionary";
import type { ProductsSort } from "@/features/products/data";

const SORT_OPTIONS: ProductsSort[] = ["newest", "nameAsc", "modelAsc"];
const SORT_LABEL_KEY: Record<ProductsSort, "products.sortNewest" | "products.sortNameAsc" | "products.sortModelAsc"> = {
  modelAsc: "products.sortModelAsc",
  nameAsc: "products.sortNameAsc",
  newest: "products.sortNewest"
};

/**
 * 排序下拉框：跟 demo 静态站 products-page.js 的"最新发布/名称A-Z/型号A-Z"排序
 * 一致，用 URL 的 sort 查询参数驱动服务端排序（Server Component 里没法直接
 * 写 onChange，所以这一小块单独抽成 client component）。
 */
export function SortSelect({
  baseHref,
  locale,
  value
}: {
  baseHref: string;
  locale: Locale;
  value: ProductsSort;
}) {
  const router = useRouter();

  return (
    <label className="flex items-center gap-2 text-[13px] text-muted-foreground">
      {t(locale, "products.sortLabel")}
      <select
        className="h-9 rounded-md border border-input bg-background px-2 text-[13px] text-foreground"
        defaultValue={value}
        onChange={(event) => {
          const url = new URL(baseHref, "http://placeholder.local");
          url.searchParams.set("sort", event.target.value);
          url.searchParams.delete("page");
          router.push(`${url.pathname}${url.search}`);
        }}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {t(locale, SORT_LABEL_KEY[option])}
          </option>
        ))}
      </select>
    </label>
  );
}
