import Link from "next/link";

import { QuoteCartPanel } from "@/components/quote-cart/quote-cart-panel";
import { getRequestDictionary } from "@/lib/i18n/server";

type QuoteCartPageProps = {
  searchParams: Promise<{
    productId?: string;
  }>;
};

export default async function QuoteCartPage({ searchParams }: QuoteCartPageProps) {
  const [{ productId }, { dictionary, locale }] = await Promise.all([
    searchParams,
    getRequestDictionary()
  ]);
  const t = dictionary.quoteCart;
  const common = dictionary.common;

  return (
    <>
      <nav className="breadcrumb container" aria-label="breadcrumb">
        <ol>
          <li>
            <Link href="/">{common.home}</Link>
          </li>
          <li>{t.pageTitle}</li>
        </ol>
      </nav>

      <main className="container" style={{ paddingBottom: 64 }}>
        <section className="section" style={{ paddingTop: 14 }}>
          <div className="section-head">
            <div>
              <h2>{t.pageTitle}</h2>
              <p>{t.pageDesc}</p>
            </div>
          </div>

          <QuoteCartPanel locale={locale} productId={productId} />

          <div className="section" id="process-section">
            <div className="section-head">
              <div>
                <h2>{t.processTitle}</h2>
                <p>{t.processDesc}</p>
              </div>
            </div>
            <div className="process-steps">
              {t.steps.map(([num, title, desc]) => (
                <div className="process-step" key={num}>
                  <div className="step-num">{num}</div>
                  <h4>{title}</h4>
                  <p>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
