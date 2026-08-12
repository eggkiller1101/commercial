import Link from "next/link";
import {
  Boxes,
  ChevronDown,
  ClipboardList,
  Files,
  LayoutDashboard,
  Package,
  PencilLine
} from "lucide-react";

const sidebarGroups = [
  {
    label: "产品管理",
    icon: Package,
    items: [
      { label: "产品列表", href: "/dashboard/products", icon: LayoutDashboard },
      { label: "产品新增", href: "/dashboard/products/new", icon: PencilLine }
    ]
  },
  {
    label: "分类管理",
    icon: Boxes,
    items: [
      {
        label: "分类列表",
        href: "/dashboard/categories",
        icon: LayoutDashboard
      },
      { label: "分类新增", href: "/dashboard/categories/new", icon: PencilLine }
    ]
  },
  {
    label: "文件管理",
    icon: Files,
    items: [
      {
        label: "文件分类",
        href: "/dashboard/documents",
        icon: LayoutDashboard
      },
      { label: "文件新增", href: "/dashboard/documents/new", icon: PencilLine }
    ]
  },
  {
    label: "询价管理",
    icon: ClipboardList,
    items: [
      { label: "询价列表", href: "/dashboard/inquiries", icon: LayoutDashboard }
    ]
  }
];

export default function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-20 w-64 border-r bg-card">
        <div className="flex h-16 items-center border-b px-5">
          <Link className="text-base font-semibold" href="/dashboard">
            企业后台管理
          </Link>
        </div>

        <nav className="space-y-2 p-3">
          {sidebarGroups.map((group) => {
            const GroupIcon = group.icon;

            return (
              <div key={group.label}>
                <button className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-left text-sm font-medium hover:bg-accent">
                  <GroupIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="min-w-0 flex-1">{group.label}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>

                <div className="mt-1 space-y-1 pl-7">
                  {group.items.map((item) => {
                    const ItemIcon = item.icon;

                    return (
                      <Link
                        className="flex h-9 w-full items-center gap-2 rounded-md px-3 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                        href={item.href}
                        key={item.label}
                      >
                        <ItemIcon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </aside>

      <header className="fixed left-64 right-0 top-0 z-10 flex h-16 items-center border-b bg-card px-6">
        <h1 className="text-lg font-semibold">CMS 首页</h1>
      </header>

      <section className="min-h-screen pl-64 pt-16">
        <div className="p-8">{children}</div>
      </section>
    </main>
  );
}
