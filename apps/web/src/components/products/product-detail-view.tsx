"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { InquiryForm } from "@/components/inquiry/inquiry-form";
import type { ProductCardItem, ProductDetail } from "@/features/products/data";
import {
  defaultLocale,
  getDictionary,
  type Locale
} from "@/lib/i18n/dictionaries";

function addToCart(product: ProductDetail, quantity: number) {
  const storageKey = "cloudintel_quote_cart_v1";
  const raw = window.localStorage.getItem(storageKey);
  const current = raw
    ? (JSON.parse(raw) as Array<{
        id: string;
        modelNumber: string;
        name: string;
        quantity: number;
      }>)
    : [];
  const existing = current.find((item) => item.id === product.id);

  if (existing) {
    existing.quantity += quantity;
  } else {
    current.push({
      id: product.id,
      modelNumber: product.modelNumber,
      name: product.name,
      quantity
    });
  }

  window.localStorage.setItem(storageKey, JSON.stringify(current));
}

function RelatedProductCard({ product }: { product: ProductCardItem }) {
  return (
    <Link className="product-card" href={`/products/${product.slug}`}>
      <div className="thumb">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img alt={product.name} src={product.imageUrl} />
        ) : null}
      </div>
      <div className="body">
        <span className="model-number">{product.modelNumber}</span>
        <h3>{product.name}</h3>
        <p className="summary">{product.summary || ""}</p>
      </div>
    </Link>
  );
}

export function ProductDetailView({
  locale = defaultLocale,
  product,
  relatedProducts
}: {
  locale?: Locale;
  product: ProductDetail;
  relatedProducts: ProductCardItem[];
}) {
  const dictionary = getDictionary(locale);
  const t = dictionary.products;
  const common = dictionary.common;
  const [activeImage, setActiveImage] = useState(
    product.images[0] ?? product.imageUrl ?? "/assets/icons/generic-product.svg"
  );
  const [activeTab, setActiveTab] = useState("description");
  const [quantity, setQuantity] = useState(1);

  const tabs = useMemo(
    () => [
      { key: "description", label: t.tabs.description },
      { key: "specs", label: t.tabs.specs },
      { key: "variants", label: t.tabs.variants },
      { key: "documents", label: t.tabs.documents }
    ],
    [t]
  );

  return (
    <>
      <nav className="breadcrumb container" aria-label="breadcrumb">
        <ol>
          <li>
            <Link href="/">{common.home}</Link>
          </li>
          <li>
            <Link href="/products">{t.breadcrumb}</Link>
          </li>
          {product.categoryName ? (
            <li>
              <Link href={`/products?category=${product.categorySlug}`}>
                {product.categoryName}
              </Link>
            </li>
          ) : null}
          <li>{product.name}</li>
        </ol>
      </nav>

      <main id="product-main">
        <div className="container">
          <div
            id="product-overview"
            style={{
              display: "grid",
              gap: 48,
              gridTemplateColumns: "440px 1fr",
              paddingBottom: 16
            }}
          >
            <div id="gallery">
              <div className="gallery-main" id="gallery-main">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt={product.name} id="gallery-main-img" src={activeImage} />
              </div>
              {product.images.length > 1 ? (
                <div className="gallery-thumbs">
                  {product.images.map((image) => (
                    <button
                      className={`thumb ${activeImage === image ? "is-active" : ""}`}
                      key={image}
                      onClick={() => setActiveImage(image)}
                      type="button"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt="" src={image} />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div id="product-info">
              <div className="product-meta-row">
                {product.categoryName ? (
                  <span className="badge badge-category">{product.categoryName}</span>
                ) : null}
                {product.isFeatured ? (
                  <span className="badge badge-featured">{common.featured}</span>
                ) : null}
              </div>
              <h1 className="product-title">{product.name}</h1>
              <p className="text-muted" style={{ fontSize: 13 }}>
                {t.model}
                <strong style={{ color: "var(--primary-700)" }}>
                  {product.modelNumber}
                </strong>
              </p>
              <p style={{ marginTop: 14 }}>{product.summary || ""}</p>

              <div className="detail-actions">
                <div className="qty-stepper" id="detail-qty-stepper">
                  <button
                    aria-label={t.decreaseQty}
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    type="button"
                  >
                    −
                  </button>
                  <input
                    id="detail-qty-input"
                    min={1}
                    onChange={(event) =>
                      setQuantity(Math.max(1, Number(event.target.value) || 1))
                    }
                    type="number"
                    value={quantity}
                  />
                  <button
                    aria-label={t.increaseQty}
                    onClick={() => setQuantity((value) => value + 1)}
                    type="button"
                  >
                    +
                  </button>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => addToCart(product, quantity)}
                  type="button"
                >
                  {common.addToQuote}
                </button>
                <a className="btn btn-outline" href="#inquiry">
                  {t.quoteNow}
                </a>
                <button
                  className="btn btn-outline"
                  onClick={() => setActiveTab("documents")}
                  type="button"
                >
                  {t.downloadDocuments}
                </button>
              </div>
            </div>
          </div>

          <section id="tabs-section">
            <div className="tabs-nav" id="tabs-nav">
              {tabs.map((tab) => (
                <button
                  className={activeTab === tab.key ? "is-active" : ""}
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div id="tabs-content">
              <div
                className={`tab-panel ${
                  activeTab === "description" ? "is-active" : ""
                }`}
              >
                <div className="prose">
                  <p>{product.description || t.noDescription}</p>
                  {product.applicationNotes ? (
                    <p>
                      <strong>{t.applicationNotes}</strong>
                      {product.applicationNotes}
                    </p>
                  ) : null}
                </div>
              </div>

              <div
                className={`tab-panel ${activeTab === "specs" ? "is-active" : ""}`}
              >
                <p className="text-muted">{t.noSpecs}</p>
              </div>

              <div
                className={`tab-panel ${
                  activeTab === "variants" ? "is-active" : ""
                }`}
              >
                {product.variants.length ? (
                  <table className="variant-table">
                    <thead>
                      <tr>
                        <th>SKU</th>
                        <th>{t.variantName}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.variants.map((variant) => (
                        <tr key={variant.sku}>
                          <td>{variant.sku}</td>
                          <td>{variant.name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-muted">{t.noVariants}</p>
                )}
              </div>

              <div
                className={`tab-panel ${
                  activeTab === "documents" ? "is-active" : ""
                }`}
              >
                {product.documents.length ? (
                  <ul className="doc-list">
                    {product.documents.map((document) => (
                      <li key={`${document.title}-${document.fileUrl}`}>
                        <div className="doc-info">
                          <span className="doc-icon">
                            {(document.fileType || "FILE").toUpperCase()}
                          </span>
                          <div>
                            <div className="doc-name">{document.title}</div>
                          </div>
                        </div>
                        <a
                          className="btn btn-outline btn-sm"
                          href={document.fileUrl}
                          rel="noopener"
                          target="_blank"
                        >
                          {common.download}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted">{t.noDocuments}</p>
                )}
              </div>
            </div>
          </section>

          {relatedProducts.length ? (
            <section className="section related-products" id="related-section">
              <div className="section-head">
                <div>
                  <h2>{t.related}</h2>
                </div>
              </div>
              <div className="product-grid">
                {relatedProducts.map((item) => (
                  <RelatedProductCard key={item.id} product={item} />
                ))}
              </div>
            </section>
          ) : null}

          <section className="section" id="inquiry">
            <div className="section-head">
              <div>
                <h2>{t.inquiryTitle}</h2>
                <p>
                  {t.inquiryDescPrefix} <strong>{product.name}</strong>，
                  {t.inquiryDescSuffix}
                </p>
              </div>
            </div>
            <div style={{ maxWidth: 640 }}>
              <InquiryForm locale={locale} productId={product.id} />
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
