import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getRequestDictionary } from "@/lib/i18n/server";

import "./globals.css";
import "./prototype-css/base.css";
import "./prototype-css/layout.css";
import "./prototype-css/components.css";
import "./prototype-css/pages.css";

export const metadata: Metadata = {
  title: "企业官网",
  description: "企业产品展示与询价网站"
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { dictionary, locale } = await getRequestDictionary();

  return (
    <html lang={locale === "zh" ? "zh-CN" : "en"}>
      <body>
        <SiteHeader dictionary={dictionary} locale={locale} />
        <main className="min-h-[calc(100vh-9rem)]">{children}</main>
        <SiteFooter dictionary={dictionary} />
      </body>
    </html>
  );
}
