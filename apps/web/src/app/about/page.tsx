import Link from "next/link";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { t } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/get-locale";

const TAGS = ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7"] as const;
const SIDE_ITEMS = ["sideLi1", "sideLi2", "sideLi3", "sideLi4", "sideLi5"] as const;
const TIMELINE = [
  { key: "timeline1925", year: "1925" },
  { key: "timeline2005", year: "2005" },
  { key: "timeline2010", year: "2010" }
] as const;
const CERTS = ["CCCF", "CCS", "FM", "UL", "LPCB", "VdS", "EU PED", "ISO 9001", "CE", "API", "ABS", "DNV"];

export default async function AboutPage() {
  const locale = await getLocale();

  return (
    <div>
      <Breadcrumb items={[{ href: "/about", label: t(locale, "nav.about") }]} locale={locale} />

      <div className="bg-primary-900 text-neutral-0">
        <div className="mx-auto max-w-site px-4 py-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-secondary-300">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary-400" />
            {t(locale, "about.partnerBadge")}
          </div>
          <h1 className="max-w-2xl text-[28px] font-bold leading-tight md:text-[34px]">
            {t(locale, "about.title")}
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-7 text-neutral-300">
            {t(locale, "about.subtitle")}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-site px-4 py-12">
        <section className="grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div className="space-y-4 leading-7 text-muted-foreground">
            <p>{t(locale, "about.p1")}</p>
            <p>{t(locale, "about.p2")}</p>
            <p>{t(locale, "about.p3")}</p>
            <div className="flex flex-wrap gap-2 pt-2">
              {TAGS.map((key) => (
                <span
                  className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700"
                  key={key}
                >
                  {t(locale, `about.${key}` as const)}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h4 className="mb-4 text-sm font-semibold">{t(locale, "about.sideHeading")}</h4>
            <ul className="space-y-3">
              {SIDE_ITEMS.map((key) => (
                <li className="text-[13px] leading-6 text-muted-foreground" key={key}>
                  <strong className="text-foreground">
                    {t(locale, `about.${key}Label` as const)}
                  </strong>{" "}
                  {t(locale, `about.${key}Value` as const)}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mt-14">
          <div className="mb-6">
            <h2 className="text-[22px] font-bold">{t(locale, "about.timelineHeading")}</h2>
            <p className="mt-1.5 text-[13.5px] text-muted-foreground">
              {t(locale, "about.timelineSub")}
            </p>
          </div>
          <div className="relative space-y-8 border-l-2 border-border pl-8">
            {TIMELINE.map((item) => (
              <div className="relative" key={item.year}>
                <span className="absolute -left-[41px] top-1 h-3 w-3 rounded-full border-2 border-primary-500 bg-card" />
                <div className="text-lg font-bold text-primary-600">{item.year}</div>
                <p className="mt-1.5 max-w-2xl text-[13.5px] leading-6 text-muted-foreground">
                  {t(locale, `about.${item.key}` as const)}
                </p>
              </div>
            ))}
            <div className="relative">
              <span className="absolute -left-[41px] top-1 h-3 w-3 rounded-full border-2 border-secondary-500 bg-card" />
              <div className="text-lg font-bold text-primary-600">
                {locale === "en" ? "Today" : "现在"}
              </div>
              <p className="mt-1.5 max-w-2xl text-[13.5px] leading-6 text-muted-foreground">
                {t(locale, "about.timelineNow")}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-14">
          <div className="mb-6">
            <h2 className="text-[22px] font-bold">{t(locale, "about.certHeading")}</h2>
            <p className="mt-1.5 text-[13.5px] text-muted-foreground">
              {t(locale, "about.certSub")}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {CERTS.map((cert) => (
              <div
                className="flex h-16 items-center justify-center rounded-md bg-primary-50 text-sm font-bold text-primary-700"
                key={cert}
              >
                {cert}
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{t(locale, "about.certNote")}</p>
        </section>

        <section className="mt-14">
          <div className="flex flex-wrap items-center justify-between gap-6 rounded-lg border border-border bg-card p-7">
            <div>
              <h3 className="text-lg font-semibold">{t(locale, "about.ctaTitle")}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{t(locale, "about.ctaDesc")}</p>
            </div>
            <Link
              className="inline-flex h-[42px] items-center justify-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground hover:bg-primary-600"
              href="/contact"
            >
              {t(locale, "about.ctaBtn")}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
