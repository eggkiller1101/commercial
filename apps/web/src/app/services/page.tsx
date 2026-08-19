import Link from "next/link";

import { getRequestDictionary } from "@/lib/i18n/server";

export default async function ServicesPage() {
  const { dictionary } = await getRequestDictionary();
  const t = dictionary.staticPages.services;
  const common = dictionary.common;

  return (
    <>
      <nav className="breadcrumb container" aria-label="breadcrumb">
        <ol>
          <li>
            <Link href="/">{common.home}</Link>
          </li>
          <li>{t.breadcrumb}</li>
        </ol>
      </nav>

      <div className="hero hero-compact">
        <div className="container hero-inner">
          <div className="hero-eyebrow">{t.breadcrumb}</div>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
      </div>

      <main className="container" style={{ paddingBottom: 64 }}>
        <section className="section" style={{ paddingTop: 20 }}>
          <div className="scenario-grid">
            {t.items.map(([icon, title, desc]) => (
              <article className="scenario-card" key={title}>
                <div>
                  <div className="icon-wrap">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt="" src={icon} />
                  </div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
                <Link href="/contact">{t.cardCta}</Link>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <h2>{t.processTitle}</h2>
              <p>{t.processDesc}</p>
            </div>
          </div>
          <div className="process-steps">
            {t.processSteps.map(
              (item, index) => (
                <div className="process-step" key={item}>
                  <div className="step-num">{index + 1}</div>
                  <h4>{item}</h4>
                  <p>{t.processItemDesc}</p>
                </div>
              )
            )}
          </div>
        </section>
      </main>
    </>
  );
}
