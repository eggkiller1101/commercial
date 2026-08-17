import Link from "next/link";
import { notFound } from "next/navigation";

import { getCategoryBySlug } from "@/features/categories/data";
import { getPublishedProducts } from "@/features/products/data";

type CategoryPageProps = {
  params: Promise<{
    categorySlug: string;
  }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categorySlug } = await params;
  const [category, products] = await Promise.all([
    getCategoryBySlug(categorySlug),
    getPublishedProducts({ categorySlug })
  ]);

  if (!category) {
    notFound();
  }

  const featuredProducts = products.filter((product) => product.isFeatured);

  return (
    <>
      <nav className="breadcrumb container" aria-label="breadcrumb">
        <ol>
          <li>
            <Link href="/">首页</Link>
          </li>
          <li>
            <Link href="/products">产品中心</Link>
          </li>
          <li>{category.name}</li>
        </ol>
      </nav>

      <div className="hero hero-compact">
        <div className="container hero-inner">
          <div className="hero-eyebrow">产品中心</div>
          <h1>{category.name}</h1>
          <p>{category.description || ""}</p>
          <div className="hero-actions">
            <Link className="btn btn-secondary" href={`/products?category=${category.slug}`}>
              浏览全部产品（{products.length}）
            </Link>
            <Link
              className="btn btn-outline"
              href="#contact-cta"
              style={{
                background: "rgba(255,255,255,.08)",
                borderColor: "rgba(255,255,255,.4)",
                color: "#fff"
              }}
            >
              获取选型建议
            </Link>
          </div>
        </div>
      </div>

      <main className="container" id="category-main" style={{ paddingBottom: 64 }}>
        {category.subcategories?.length ? (
          <section className="section" id="subcategory-section">
            <div className="section-head">
              <div>
                <h2>子分类</h2>
                <p>选择下面的子分类，快速定位到具体产品系列</p>
              </div>
            </div>
            <div className="subcategory-grid">
              {category.subcategories.map((child) => (
                <Link
                  className="subcategory-card"
                  href={`/products?category=${child.slug}`}
                  key={child.id}
                >
                  <div className="icon-wrap">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt="" src="/assets/icons/generic-product.svg" />
                  </div>
                  <h3>{child.name}</h3>
                  <p>查看该系列下的产品与技术资料。</p>
                  <span className="card-link">查看产品 →</span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {featuredProducts.length ? (
          <section className="section" id="featured-section">
            <div className="section-head">
              <div>
                <h2>重点推荐</h2>
                <p>该分类下的重点产品</p>
              </div>
              <Link className="view-all" href={`/products?category=${category.slug}`}>
                查看全部 →
              </Link>
            </div>
            <div className="product-grid">
              {featuredProducts.map((product) => (
                <article className="product-card" key={product.id}>
                  <Link className="thumb" href={`/products/${product.slug}`}>
                    <span className="badge badge-featured">重点推荐</span>
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img alt={product.name} src={product.imageUrl} />
                    ) : null}
                  </Link>
                  <div className="body">
                    <span className="model-number">{product.modelNumber}</span>
                    <h3>{product.name}</h3>
                    <p className="summary">{product.summary || ""}</p>
                    <div className="card-actions">
                      <Link
                        className="btn btn-outline btn-sm"
                        href={`/products/${product.slug}`}
                      >
                        查看详情
                      </Link>
                      <Link
                        className="btn btn-add-cart btn-sm"
                        href={`/quote-cart?productId=${product.id}`}
                      >
                        + 加入清单
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        <section className="section" id="contact-cta">
          <div
            className="inquiry-card"
            style={{
              alignItems: "center",
              display: "flex",
              flexWrap: "wrap",
              gap: 24,
              justifyContent: "space-between"
            }}
          >
            <div>
              <h3 style={{ fontSize: 16, marginBottom: 6 }}>
                需要该分类的选型建议？
              </h3>
              <p className="text-muted">工程师可根据项目场景推荐合适产品。</p>
            </div>
            <Link className="btn btn-primary" href="/contact">
              联系我们
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
