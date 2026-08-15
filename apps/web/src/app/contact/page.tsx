import Link from "next/link";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageHero } from "@/components/layout/page-hero";
import { WechatQrTrigger } from "@/components/layout/wechat-qr-trigger";
import { InquiryForm } from "@/components/inquiry/inquiry-form";
import { t } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/get-locale";
import { SITE_CONFIG } from "@/lib/site-config";

const FAQS = ["faq1", "faq2", "faq3", "faq4"] as const;

export default async function ContactPage() {
  const locale = await getLocale();

  return (
    <div>
      <Breadcrumb items={[{ href: "/contact", label: t(locale, "nav.contact") }]} locale={locale} />

      <PageHero
        description={t(locale, "contact.heroDesc")}
        eyebrow={t(locale, "contact.heroEyebrow")}
        title={t(locale, "contact.heroTitle")}
      />

      <div className="mx-auto max-w-site px-4 py-10">
        {/* ============ 联系渠道卡片：图标 + 标题 + 值 + 说明文字，跟 demo 一致 ============ */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-xl">
              📞
            </div>
            <h3 className="text-sm font-semibold">{t(locale, "contact.channelHotlineTitle")}</h3>
            <p className="mt-1.5 text-[15px] font-semibold">{SITE_CONFIG.SERVICE_HOTLINE}</p>
            <p className="mt-1 text-[11.5px] text-muted-foreground">
              {t(locale, "contact.channelHotlineCaption")}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-xl">
              ✉️
            </div>
            <h3 className="text-sm font-semibold">{t(locale, "contact.channelEmailTitle")}</h3>
            <p className="mt-1.5 text-[15px] font-semibold">{SITE_CONFIG.SERVICE_EMAIL}</p>
            <p className="mt-1 text-[11.5px] text-muted-foreground">
              {t(locale, "contact.channelEmailCaption")}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-xl">
              💬
            </div>
            <h3 className="text-sm font-semibold">{t(locale, "contact.channelWechatTitle")}</h3>
            <p className="mt-1.5 text-[15px] font-semibold">
              <WechatQrTrigger label={SITE_CONFIG.WECHAT_LABEL} />
            </p>
            <p className="mt-1 text-[11.5px] text-muted-foreground">
              {t(locale, "contact.channelWechatCaption")}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-primary-50 text-xl">
              📝
            </div>
            <h3 className="text-sm font-semibold">{t(locale, "contact.channelInquiryTitle")}</h3>
            <p className="mt-1.5 text-[15px] font-semibold">
              {t(locale, "contact.channelInquiryValue")}
            </p>
            <p className="mt-1 text-[11.5px] text-muted-foreground">
              {t(locale, "contact.channelInquiryCaption")}{" "}
              <Link className="text-primary-600 hover:underline" href="/quote-cart">
                {t(locale, "footer.linkQuoteCart")}
              </Link>
            </p>
          </div>
        </div>

        {/* ============ 表单 + 办公信息/FAQ 两栏布局 ============ */}
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-1.5 text-base font-semibold">{t(locale, "contact.formHeading")}</h2>
            <p className="mb-4 text-[13px] text-muted-foreground">
              {t(locale, "contact.formDesc")}
            </p>
            <InquiryForm />
          </div>

          <div>
            <div className="rounded-lg border border-border bg-card p-6">
              <h4 className="mb-3.5 text-sm font-bold text-primary-800">
                {t(locale, "contact.officeHeading")}
              </h4>
              <ul>
                <li className="flex justify-between gap-3 border-b border-dashed border-border py-2.5 text-[13px] text-muted-foreground">
                  <strong className="shrink-0 font-semibold text-foreground">
                    {t(locale, "contact.officeCompanyLabel")}
                  </strong>
                  <span className="text-right">{SITE_CONFIG.SITE_NAME_FULL}</span>
                </li>
                <li className="flex justify-between gap-3 border-b border-dashed border-border py-2.5 text-[13px] text-muted-foreground">
                  <strong className="shrink-0 font-semibold text-foreground">
                    {t(locale, "contact.officeAddressLabel")}
                  </strong>
                  <span className="text-right">{t(locale, "contact.officeAddressValue")}</span>
                </li>
                <li className="flex justify-between gap-3 border-b border-dashed border-border py-2.5 text-[13px] text-muted-foreground">
                  <strong className="shrink-0 font-semibold text-foreground">
                    {t(locale, "contact.officeResponseLabel")}
                  </strong>
                  <span className="text-right">{t(locale, "contact.officeResponseValue")}</span>
                </li>
                <li className="flex justify-between gap-3 py-2.5 text-[13px] text-muted-foreground">
                  <strong className="shrink-0 font-semibold text-foreground">
                    {t(locale, "contact.officeIntlLabel")}
                  </strong>
                  <span className="text-right">{t(locale, "contact.officeIntlValue")}</span>
                </li>
              </ul>
            </div>

            <div className="mt-6">
              <h3 className="mb-3 text-[15px] font-semibold">{t(locale, "contact.faqHeading")}</h3>
              <div className="space-y-2.5">
                {FAQS.map((key, index) => (
                  <details
                    className="group rounded-md border border-border bg-card px-4 py-3"
                    key={key}
                    open={index === 0}
                  >
                    <summary className="cursor-pointer text-[13.5px] font-medium text-foreground marker:content-none">
                      {t(locale, `contact.${key}Q` as const)}
                    </summary>
                    <p className="mt-2 text-[13px] leading-6 text-muted-foreground">
                      {t(locale, `contact.${key}A` as const)}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
