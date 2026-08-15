import Image from "next/image";
import Link from "next/link";

import { HeaderCartButton, HeaderSearch } from "@/components/layout/header-client";
import { LangToggle } from "@/components/layout/lang-toggle";
import { getCategoryTree } from "@/features/categories/data";
import { getLocale } from "@/lib/i18n/get-locale";
import { t } from "@/lib/i18n/dictionary";
import { SITE_CONFIG } from "@/lib/site-config";

export async function SiteHeader() {
  const [categoryTree, locale] = await Promise.all([getCategoryTree(), getLocale()]);

  const staticNavItems = [
    { href: "/", label: t(locale, "nav.home") },
    { href: "/documents", label: t(locale, "nav.documents") },
    { href: "/about", label: t(locale, "nav.about") },
    { href: "/contact", label: t(locale, "nav.contact") }
  ];

  return (
    <header className="sticky top-0 z-40 bg-background">
      <div className="bg-primary-900 text-neutral-200">
        <div className="mx-auto flex h-9 max-w-site items-center justify-between px-4 text-[13px]">
          <span>
            {t(locale, "common.hotlinePrefix")}
            {SITE_CONFIG.SERVICE_HOTLINE}
          </span>
          <LangToggle locale={locale} />
        </div>
      </div>

      <div className="border-b border-border bg-card">
        <div className="mx-auto flex h-[76px] max-w-site items-center justify-between gap-5 px-4">
          <Link className="flex shrink-0 items-center gap-2.5" href="/">
            <Image alt="" height={36} src="/icons/logo-mark.svg" width={36} />
            <span className="flex flex-col leading-tight">
              <span className="text-[19px] font-bold tracking-wide text-primary-800">
                {SITE_CONFIG.SITE_NAME}
              </span>
              <span className="whitespace-nowrap text-[11px] tracking-wide text-muted-foreground">
                {SITE_CONFIG.SITE_NAME_EN}
              </span>
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-3">
            <HeaderSearch locale={locale} />
            <HeaderCartButton locale={locale} />
          </div>
        </div>
      </div>

      <nav className="border-t border-border bg-neutral-50">
        <div className="mx-auto flex max-w-site justify-center px-4">
          <ul className="flex flex-nowrap gap-1">
            <li className="group relative">
              <Link
                className="flex h-12 items-center gap-1 border-b-2 border-transparent px-4 text-[14.5px] font-medium text-foreground transition-colors group-hover:border-primary-500 group-hover:bg-card group-hover:text-primary-600"
                href="/products"
              >
                {t(locale, "nav.products")}
              </Link>

              {categoryTree.length ? (
                <div className="absolute left-1/2 top-full hidden w-[min(920px,90vw)] -translate-x-1/2 translate-y-1 grid-cols-3 gap-8 rounded-md border border-border bg-card p-7 text-left shadow-lg group-hover:grid">
                  {categoryTree.map((category) => (
                    <div key={category.id}>
                      <Link
                        className="mb-3 block border-b border-border pb-2 text-[13px] font-bold text-primary-700 hover:text-primary-600"
                        href={`/categories/${category.slug}`}
                      >
                        {category.name}
                      </Link>
                      <ul>
                        {category.subcategories.map((sub) => (
                          <li key={sub.id}>
                            <Link
                              className="block py-1.5 text-[13.5px] text-foreground hover:pl-1 hover:text-primary-600"
                              href={`/categories/${sub.slug}`}
                            >
                              {sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : null}
            </li>

            {staticNavItems.map((item) => (
              <li key={item.href}>
                <Link
                  className="flex h-12 items-center border-b-2 border-transparent px-4 text-[14.5px] font-medium text-foreground transition-colors hover:border-primary-500 hover:bg-card hover:text-primary-600"
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
