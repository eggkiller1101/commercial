import Link from "next/link";

import { ProductGrid } from "@/components/products/product-grid";
import { getFeaturedProducts } from "@/features/products/data";
import { t } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/get-locale";

export default async function HomePage() {
  const [products, locale] = await Promise.all([getFeaturedProducts(), getLocale()]);

  return (
    <div>
      <section className="bg-primary-900 text-neutral-0">
        <div className="mx-auto grid max-w-site gap-10 px-4 py-16 md:grid-cols-[1.2fr_0.8fr] md:items-center md:py-20">
          <div className="space-y-6">
            <div className="text-[13px] font-bold uppercase tracking-[2px] text-secondary-300">
              {t(locale, "home.heroBadge")}
            </div>
            <h1 className="text-[32px] font-bold leading-tight md:text-[40px]">
              {t(locale, "home.heroTitle1")}
              <br />
              {t(locale, "home.heroTitle2")}
            </h1>
            <p className="max-w-xl text-[15px] leading-7 text-neutral-300">
              {t(locale, "home.heroDesc")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                className="inline-flex h-[42px] items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary-600"
                href="/products"
              >
                {t(locale, "home.browseProducts")}
              </Link>
              <Link
                className="inline-flex h-[42px] items-center justify-center rounded-md border border-white/30 px-6 text-sm font-semibold text-neutral-0 hover:border-white/70"
                href="/contact"
              >
                {t(locale, "home.ctaContact")}
              </Link>
            </div>
          </div>
          <div className="hidden aspect-[4/3] items-center justify-center rounded-md bg-white/5 text-sm text-neutral-400 md:flex">
            首页主视觉预留
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-site px-4 py-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-[22px] font-bold">{t(locale, "home.featuredHeading")}</h2>
            <p className="mt-1.5 text-[13.5px] text-muted-foreground">
              {t(locale, "home.featuredSub")}
            </p>
          </div>
          <Link className="text-[13.5px] font-semibold text-primary-600 hover:text-primary-700" href="/products">
            {t(locale, "home.viewAll")}
          </Link>
        </div>
        <ProductGrid locale={locale} products={products} />
      </section>

      <section className="mx-auto max-w-site px-4 pb-16">
        <div className="flex flex-wrap items-center justify-between gap-6 rounded-lg border border-border bg-card p-7">
          <div>
            <h3 className="text-lg font-semibold">{t(locale, "home.contactHeading")}</h3>
            <p className="mt-1.5 text-sm text-muted-foreground">{t(locale, "home.contactDesc")}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              className="inline-flex h-[42px] items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary-600"
              href="/products"
            >
              {t(locale, "home.browseProducts")}
            </Link>
            <Link
              className="inline-flex h-[42px] items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary-600"
              href="/contact"
            >
              {t(locale, "home.ctaContact")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
