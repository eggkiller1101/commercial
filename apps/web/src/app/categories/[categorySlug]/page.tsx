import Link from "next/link";
import { notFound } from "next/navigation";

import { getCategoryBySlug } from "@/features/categories/data";
import { getPublishedProducts } from "@/features/products/data";
import { getRequestDictionary } from "@/lib/i18n/server";

type CategoryPageProps = {
  params: Promise<{
    categorySlug: string;
  }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categorySlug } = await params;
  const [category, products, { dictionary }] = await Promise.all([
    getCategoryBySlug(categorySlug),
    getPublishedProducts({ categorySlug }),
    getRequestDictionary()
  ]);
  const t = dictionary.category;
  const productsText = dictionary.products;
  const common = dictionary.common;

  if (!category) {
    notFound();
  }

  const featuredProducts = products.filter((product) => product.isFeatured);

  return (
    <>
      <nav className="breadcrumb container" aria-label="breadcrumb">
        <ol>
          <li>
            <Link href="/">{common.home}</Link>
          </li>
          <li>
            <Link href="/products">{productsText.breadcrumb}</Link>
          </li>
          <li>{category.name}</li>
        </ol>
      </nav>

      <div className="hero hero-compact">
        <div className="container hero-inner">
          <div className="hero-eyebrow">{productsText.breadcrumb}</div>
          <h1>{category.name}</h1>
          <p>{category.description || ""}</p>
          <div className="hero-actions">
            <Link className="btn btn-secondary" href={`/products?category=${category.slug}`}>
              {t.browseAllPrefix}
              {products.length}
              {t.browseAllSuffix}
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
              {t.getAdvice}
            </Link>
          </div>
        </div>
      </div>

      <main className="container" id="category-main" style={{ paddingBottom: 64 }}>
        {category.subcategories?.length ? (
          <section className="section" id="subcategory-section">
            <div className="section-head">
              <div>
                <h2>{t.subcategories}</h2>
                <p>{t.subcategoriesDesc}</p>
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
                  <p>{t.subcategoryDesc}</p>
                  <span className="card-link">{t.viewProducts}</span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {featuredProducts.length ? (
          <section className="section" id="featured-section">
            <div className="section-head">
              <div>
                <h2>{common.featured}</h2>
                <p>{t.featuredDesc}</p>
              </div>
              <Link className="view-all" href={`/products?category=${category.slug}`}>
                {common.viewAll}
              </Link>
            </div>
            <div className="product-grid">
              {featuredProducts.map((product) => (
                <article className="product-card" key={product.id}>
                  <Link className="thumb" href={`/products/${product.slug}`}>
                    <span className="badge badge-featured">{common.featured}</span>
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
                        {common.viewDetails}
                      </Link>
                      <Link
                        className="btn btn-add-cart btn-sm"
                        href={`/quote-cart?productId=${product.id}`}
                      >
                        {common.addToQuote}
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
                {t.ctaTitle}
              </h3>
              <p className="text-muted">{t.ctaDesc}</p>
            </div>
            <Link className="btn btn-primary" href="/contact">
              {common.contactUs}
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
