import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

import "./globals.css";

export const metadata: Metadata = {
  title: "企业官网",
  description: "企业产品展示与询价网站"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <SiteHeader />
        <main className="min-h-[calc(100vh-9rem)]">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
