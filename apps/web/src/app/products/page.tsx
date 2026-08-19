import Link from "next/link";

import { ProductsCatalog } from "@/components/products/products-catalog";
import { getCategoryTree } from "@/features/categories/data";
import {
  getFilterableAttributeDefinitions,
  getPublishedProducts
} from "@/features/products/data";
import { getRequestDictionary } from "@/lib/i18n/server";

export default async function ProductsPage() {
  const [categories, products, attributeDefinitions, { dictionary, locale }] =
    await Promise.all([
      getCategoryTree(),
      getPublishedProducts(),
      getFilterableAttributeDefinitions(),
      getRequestDictionary()
    ]);
  const t = dictionary.home;
  const common = dictionary.common;
  const nav = dictionary.nav;

  return (
    <>
      <ProductsCatalog
        attributeDefinitions={attributeDefinitions}
        categories={categories}
        locale={locale}
        products={products}
      />

      <div className="container" style={{ paddingBottom: 64 }}>
        <section className="section">
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
              <h3 style={{ fontSize: 18, marginBottom: 6 }}>{t.ctaTitle}</h3>
              <p className="text-muted">{t.ctaBody}</p>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Link className="btn btn-primary" href="/contact">
                {common.contactUs}
              </Link>
              <Link className="btn btn-primary" href="/quote-cart">
                {nav.quote}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
