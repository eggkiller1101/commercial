import Link from "next/link";

import { ProductGrid } from "@/components/products/product-grid";
import { getFeaturedProducts } from "@/features/products/data";
import { t } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/get-locale";

const TAGS = ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7"] as const;
const SIDE_ITEMS = ["sideLi1", "sideLi2", "sideLi3", "sideLi4", "sideLi5"] as const;

export default async function HomePage() {
  const [products, locale] = await Promise.all([getFeaturedProducts(), getLocale()]);

  return (
    <div>
      {/* ============ Hero：公司定位 + 唯特利授权徽标 ============
          跟 demo 一样用 hero-bg.svg 做背景图 + 半透明深色叠加层保证文字可读性。 */}
      <section
        className="relative overflow-hidden bg-primary-900 bg-cover bg-center text-neutral-0"
        style={{ backgroundImage: "url(/icons/hero-bg.svg)" }}
      >
        <div className="absolute inset-0 bg-primary-900/50" />
        <div className="relative mx-auto max-w-site px-4 py-16 md:py-20">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/35 bg-white/10 py-1.5 pl-2.5 pr-3.5 text-[13px] font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary-400" />
            {t(locale, "home.heroBadge")}
          </div>
          <h1 className="max-w-xl text-[32px] font-bold leading-tight md:text-[34px]">
            {t(locale, "home.heroTitle1")}
            <br />
            {t(locale, "home.heroTitle2")}
          </h1>
          <p className="mt-3.5 max-w-lg text-[15px] leading-7 text-primary-100">
            {t(locale, "home.heroDesc")}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              className="inline-flex h-[42px] items-center justify-center rounded-md bg-secondary px-6 text-sm font-semibold text-secondary-foreground hover:bg-secondary-600"
              href="#featured"
            >
              {t(locale, "home.ctaProducts")}
            </Link>
            <Link
              className="inline-flex h-[42px] items-center justify-center rounded-md border border-white/40 bg-white/10 px-6 text-sm font-semibold text-neutral-0 hover:border-white/70"
              href="#video"
            >
              {t(locale, "home.ctaVideo")}
            </Link>
            <Link
              className="inline-flex h-[42px] items-center justify-center rounded-md border border-white/40 bg-white/10 px-6 text-sm font-semibold text-neutral-0 hover:border-white/70"
              href="/contact"
            >
              {t(locale, "home.ctaContact")}
            </Link>
          </div>
        </div>
      </section>

      {/* ============ 公司介绍：文案跟"关于我们"页共用同一套 i18n 词条 ============ */}
      <section className="mx-auto max-w-site px-4 py-14">
        <div className="mb-6">
          <h2 className="text-[22px] font-bold">{t(locale, "home.aboutHeading")}</h2>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">{t(locale, "about.title")}</p>
        </div>
        <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <p className="mb-3.5 text-base font-semibold text-primary-800">
              {t(locale, "about.subtitle")}
            </p>
            <p className="mb-3.5 text-[14.5px] leading-[1.9] text-foreground">
              {t(locale, "about.p1")}
            </p>
            <p className="mb-3.5 text-[14.5px] leading-[1.9] text-foreground">
              {t(locale, "about.p2")}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {TAGS.map((key) => (
                <span
                  className="rounded-full bg-primary-50 px-3.5 py-1.5 text-[12.5px] font-semibold text-primary-700"
                  key={key}
                >
                  {t(locale, `about.${key}` as const)}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h4 className="mb-3.5 text-sm font-bold text-primary-800">
              {t(locale, "about.sideHeading")}
            </h4>
            <ul>
              {SIDE_ITEMS.map((key) => (
                <li
                  className="flex gap-2.5 border-b border-dashed border-border py-2.5 text-[13.5px] text-muted-foreground last:border-none"
                  key={key}
                >
                  <strong className="min-w-[92px] shrink-0 font-semibold text-foreground">
                    {t(locale, `about.${key}Label` as const)}
                  </strong>
                  {t(locale, `about.${key}Value` as const)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ============ 公司介绍视频（占位区，跟 demo 的 video-placeholder 一致） ============ */}
      <section className="mx-auto max-w-site px-4 pb-14" id="video">
        <div className="mb-6">
          <h2 className="text-[22px] font-bold">{t(locale, "home.videoHeading")}</h2>
          <p className="mt-1.5 text-[13.5px] text-muted-foreground">{t(locale, "home.videoSub")}</p>
        </div>
        <div className="flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br from-primary-800 to-primary-500 text-center text-neutral-0">
          <div>
            <div className="mx-auto mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-white/60 bg-white/15 text-2xl">
              ▶
            </div>
            <p className="text-[13.5px] text-primary-100">{t(locale, "home.videoPlaceholderTitle")}</p>
            <p className="mt-1 text-xs text-primary-200">{t(locale, "home.videoPlaceholderHint")}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-site px-4 py-12" id="featured">
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
