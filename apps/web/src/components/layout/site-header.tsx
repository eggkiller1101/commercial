import Link from "next/link";

import { getCategoryTree } from "@/features/categories/data";

const navItems = [
  { href: "/", key: "home", label: "首页" },
  { href: "/products", key: "products", label: "产品中心" },
  { href: "/industries", key: "industries", label: "行业应用" },
  { href: "/services", key: "services", label: "技术与服务" },
  { href: "/cases", key: "cases", label: "项目案例" },
  { href: "/resources", key: "resources", label: "资料中心" },
  { href: "/about", key: "about", label: "关于我们" },
  { href: "/contact", key: "contact", label: "联系我们" }
];

export async function SiteHeader() {
  const categories = await getCategoryTree();

  return (
    <>
      <div className="topbar">
        <div className="container">
          <div className="topbar-links">
            <span>服务热线：400-000-0000</span>
          </div>
          <div className="topbar-links">
            <button className="lang-toggle-btn" type="button">
              English
            </button>
          </div>
        </div>
      </div>

      <header className="site-header">
        <div className="container header-row-top">
          <Link className="logo" href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="云工智上 logo"
              className="logo-mark"
              src="/assets/icons/logo-mark.svg"
            />
            <span>
              <span className="logo-text">云工智上</span>
              <span className="logo-sub">
                CloudIntel Works (Beijing) Technology Co., Ltd.
              </span>
            </span>
          </Link>

          <div className="header-actions">
            <form action="/products" className="header-search" role="search">
              <button className="header-search-btn" type="submit">
                🔍
              </button>
              <input
                id="header-search-input"
                name="q"
                placeholder="搜索产品名称 / 型号"
                type="search"
              />
            </form>
            <Link className="btn btn-primary btn-sm cart-btn" href="/quote-cart">
              上传清单询价
              <span className="cart-count-badge" id="cart-count-badge">
                0
              </span>
            </Link>
          </div>
        </div>

        <nav className="main-nav-bar">
          <div className="container">
            <ul className="main-nav-list">
              {navItems.map((item) => (
                <li key={item.key}>
                  <Link className="nav-link" href={item.href}>
                    {item.label}
                  </Link>
                  {item.key === "products" ? (
                    <div className="mega-menu">
                      {categories.map((category) => (
                        <div className="mega-col" key={category.id}>
                          <div className="mega-col-title">
                            <Link href={`/categories/${category.slug}`}>
                              {category.name}
                            </Link>
                          </div>
                          <ul>
                            {category.subcategories?.map((subcategory) => (
                              <li key={subcategory.id}>
                                <Link
                                  href={`/products?category=${subcategory.slug}`}
                                >
                                  {subcategory.name}
                                </Link>
                              </li>
                            ))}
                            <li>
                              <Link
                                href={`/categories/${category.slug}`}
                                style={{
                                  color: "var(--primary-600)",
                                  fontWeight: 600
                                }}
                              >
                                查看全部 →
                              </Link>
                            </li>
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>
    </>
  );
}
