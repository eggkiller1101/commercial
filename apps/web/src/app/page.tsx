import Link from "next/link";

import { getFeaturedProducts } from "@/features/products/data";
import { getRequestDictionary } from "@/lib/i18n/server";

export default async function HomePage() {
  const [{ dictionary }, products] = await Promise.all([
    getRequestDictionary(),
    getFeaturedProducts()
  ]);
  const t = dictionary.home;
  const common = dictionary.common;

  return (
    <>
      <div className="data-source-banner">
        <strong>{common.dataSource}</strong> · {common.dataSourceText}
      </div>

      <div className="hero">
        <div className="container hero-inner">
          <span className="partner-badge">
            <span className="dot" />
            <span>{t.heroBadge}</span>
          </span>
          <h1>{t.heroTitle}</h1>
          <p>{t.heroBody}</p>
          <div className="hero-actions">
            <Link className="btn btn-secondary" href="#products">
              {t.productAnchor}
            </Link>
            <Link
              className="btn btn-outline"
              href="#video"
              style={{
                background: "rgba(255,255,255,.08)",
                borderColor: "rgba(255,255,255,.4)",
                color: "#fff"
              }}
            >
              {t.watchVideo}
            </Link>
            <Link
              className="btn btn-outline"
              href="/contact"
              style={{
                background: "rgba(255,255,255,.08)",
                borderColor: "rgba(255,255,255,.4)",
                color: "#fff"
              }}
            >
              {common.contactUs}
            </Link>
          </div>
        </div>
      </div>

      <main>
        <div className="container">
          <section className="section" id="about">
            <div className="section-head">
              <div>
                <h2>{t.aboutTitle}</h2>
                <p>{t.aboutSubtitle}</p>
              </div>
            </div>
            <div className="about-grid">
              <div className="about-copy">
                <p className="about-lede">
                  {t.aboutLede}
                </p>
                <p>{t.aboutBody1}</p>
                <p>
                  公司为<strong>唯特利 Victaulic®</strong>
                  {t.aboutBody2}
                </p>
                <div className="tag-badge-list">
                  {[
                    "消防机电",
                    "工业建设",
                    "市政基建",
                    "海外总包",
                    "智慧建筑",
                    "能源工程",
                    "交通商旅配套"
                  ].map((tag) => (
                    <span className="tag-badge" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="about-side">
                <h4>{t.coreBase}</h4>
                <ul>
                  {t.coreItems.map(([label, value]) => (
                    <li key={label}>
                      <strong>{label}</strong>
                      <span>{value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="section" id="video">
            <div className="section-head">
              <div>
                <h2>{t.introVideo}</h2>
                <p>{t.introVideoDesc}</p>
              </div>
            </div>
            <div className="video-frame">
              <video controls preload="metadata" src="/assets/index_video.mp4">
                {t.videoUnsupported}
              </video>
            </div>
          </section>

          <section className="section" id="products">
            <div className="section-head">
              <div>
                <h2>{t.featuredProducts}</h2>
                <p>{t.featuredProductsDesc}</p>
              </div>
              <Link className="view-all" href="/products">
                {common.viewAll}
              </Link>
            </div>
            <div className="product-grid">
              {products.map((product) => (
                <article className="product-card" key={product.id}>
                  <Link className="thumb" href={`/products/${product.slug}`}>
                    {product.isFeatured ? (
                      <span className="badge badge-featured">{common.featured}</span>
                    ) : null}
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img alt={product.name} src={product.imageUrl} />
                    ) : (
                      <span className="text-muted">{common.noImage}</span>
                    )}
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

          <section className="section" id="contact">
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
                <h3 style={{ fontSize: 18, marginBottom: 6 }}>
                  {t.ctaTitle}
                </h3>
                <p className="text-muted">
                  {t.ctaBody}
                </p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                <Link className="btn btn-primary" href="/products">
                  {t.browseProducts}
                </Link>
                <Link className="btn btn-primary" href="/contact">
                  {common.contactUs}
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
