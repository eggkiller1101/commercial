import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CartProvider } from "@/features/quote-cart/cart-context";

import "./globals.css";

export const metadata: Metadata = {
  title: "云工智上 - 企业产品展示与询价平台",
  description: "云工智上（北京）科技有限公司 · Victaulic 授权经销商，产品展示与询价网站"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <CartProvider>
          <SiteHeader />
          <main className="min-h-[calc(100vh-9rem)]">{children}</main>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
