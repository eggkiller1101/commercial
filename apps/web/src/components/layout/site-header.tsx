import Link from "next/link";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/products", label: "产品中心" },
  { href: "/documents", label: "资料下载" },
  { href: "/inquiry", label: "询价" },
  { href: "/contact", label: "联系我们" }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link className="text-lg font-semibold" href="/">
          企业官网
        </Link>

        <nav className="flex items-center gap-5 text-sm text-muted-foreground">
          {navItems.map((item) => (
            <Link
              className="transition-colors hover:text-foreground"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
