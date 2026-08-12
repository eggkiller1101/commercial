import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "企业后台管理",
  description: "企业后台管理 CMS"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
