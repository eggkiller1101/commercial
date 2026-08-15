import Image from "next/image";
import Link from "next/link";

import { WechatQrTrigger } from "@/components/layout/wechat-qr-trigger";
import { t } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/get-locale";
import { SITE_CONFIG } from "@/lib/site-config";

export async function SiteFooter() {
  const locale = await getLocale();

  return (
    <footer className="mt-16 bg-primary-900 text-neutral-300">
      <div className="mx-auto grid max-w-site grid-cols-1 gap-8 px-4 py-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.9fr_1.3fr]">
        <div>
          <Link className="flex items-center gap-2.5" href="/">
            <Image alt="" height={36} src="/icons/logo-mark.svg" width={36} />
            <span className="text-[19px] font-bold tracking-wide text-neutral-0">
              {SITE_CONFIG.SITE_NAME}
            </span>
          </Link>
          <p className="mt-3.5 text-[13px] leading-[1.8] text-neutral-400">
            {t(locale, "footer.tagline")}
          </p>
          <Link
            className="mt-3.5 inline-block text-[13px] font-semibold text-primary-300 hover:text-neutral-0"
            href="/about"
          >
            {t(locale, "nav.about")} →
          </Link>
        </div>

        <div>
          <h4 className="mb-4 text-sm text-neutral-0">{t(locale, "footer.colProducts")}</h4>
          <ul>
            <li className="mb-2.5">
              <Link className="text-[13px] text-neutral-400 hover:text-neutral-0" href="/products">
                {t(locale, "footer.linkAllProducts")}
              </Link>
            </li>
            <li className="mb-2.5">
              <Link className="text-[13px] text-neutral-400 hover:text-neutral-0" href="/documents">
                {t(locale, "footer.linkDocuments")}
              </Link>
            </li>
            <li className="mb-2.5">
              <Link className="text-[13px] text-neutral-400 hover:text-neutral-0" href="/quote-cart">
                {t(locale, "footer.linkQuoteCart")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm text-neutral-0">{t(locale, "footer.colContact")}</h4>
          <ul>
            <li className="mb-2.5 flex items-baseline justify-between gap-4 text-[13px] leading-6">
              <span className="shrink-0 text-neutral-500">{t(locale, "footer.hotlineLabel")}</span>
              <span className="break-words text-right text-neutral-0">
                {SITE_CONFIG.SERVICE_HOTLINE}
              </span>
            </li>
            <li className="mb-2.5 flex items-baseline justify-between gap-4 text-[13px] leading-6">
              <span className="shrink-0 text-neutral-500">{t(locale, "footer.channelEmailLabel")}</span>
              <span className="break-words text-right text-neutral-0">
                {SITE_CONFIG.SERVICE_EMAIL}
              </span>
            </li>
            <li className="mb-2.5 flex items-baseline justify-between gap-4 text-[13px] leading-6">
              <span className="shrink-0 text-neutral-500">{t(locale, "footer.channelWechatLabel")}</span>
              <WechatQrTrigger
                className="text-neutral-0 hover:text-primary-200"
                label={t(locale, "footer.channelWechatValue")}
              />
            </li>
            <li className="flex text-[13px]">
              <Link className="font-semibold text-primary-300 hover:text-neutral-0" href="/contact">
                {t(locale, "footer.onlineInquiry")}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-site px-4 py-4.5 text-xs text-neutral-500">
          © 2026 {SITE_CONFIG.SITE_NAME_FULL}. {t(locale, "footer.copyrightSuffix")}
        </div>
      </div>
    </footer>
  );
}
