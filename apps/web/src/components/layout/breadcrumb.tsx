import Link from "next/link";

import { t, type Locale } from "@/lib/i18n/dictionary";

/**
 * 跟 demo 静态站 UI.renderBreadcrumb 对应的面包屑组件：首页 / 当前页面。
 * 最后一项（当前页）不可点击，之前的每一项都是链接。
 */
export function Breadcrumb({
  items,
  locale
}: {
  items: Array<{ href: string; label: string }>;
  locale: Locale;
}) {
  const allItems = [{ href: "/", label: t(locale, "nav.home") }, ...items];

  return (
    <nav aria-label="breadcrumb" className="border-b border-border bg-neutral-50">
      <ol className="mx-auto flex max-w-site flex-wrap items-center gap-1.5 px-4 py-2.5 text-[12.5px] text-muted-foreground">
        {allItems.map((item, index) => (
          <li className="flex items-center gap-1.5" key={item.href}>
            {index > 0 ? <span className="text-neutral-300">/</span> : null}
            {index === allItems.length - 1 ? (
              <span className="text-foreground">{item.label}</span>
            ) : (
              <Link className="hover:text-primary-600" href={item.href}>
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
