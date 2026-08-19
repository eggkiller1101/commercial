import Link from "next/link";

import { InquiryForm } from "@/components/inquiry/inquiry-form";
import { getRequestDictionary } from "@/lib/i18n/server";

type ContactPageProps = {
  searchParams: Promise<{
    productId?: string;
  }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const [{ productId }, { dictionary, locale }] = await Promise.all([
    searchParams,
    getRequestDictionary()
  ]);
  const t = dictionary.contact;
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
          <h1>{t.heroTitle}</h1>
          <p>{t.heroDesc}</p>
        </div>
      </div>

      <main className="container" style={{ paddingBottom: 64 }}>
        <section className="section" style={{ paddingTop: 20 }}>
          <div className="contact-channel-grid">
            {t.channels.map(([icon, title, value, desc]) => (
              <div className="contact-channel-card" key={title}>
                <div className="icon-wrap">{icon}</div>
                <h3>{title}</h3>
                <p>{value}</p>
                <p className="text-muted" style={{ fontSize: 11.5, marginTop: 4 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          className="section"
          style={{
            alignItems: "start",
            display: "grid",
            gap: 32,
            gridTemplateColumns: "1.3fr 1fr"
          }}
        >
          <div>
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>{t.formTitle}</h3>
            <p className="text-muted" style={{ fontSize: 13, marginBottom: 16 }}>
              {t.formDesc}
            </p>
            <InquiryForm
              defaultMessage={productId ? `${t.consultProduct}${productId}` : ""}
              locale={locale}
              productId={productId}
              submitLabel={t.submitLabel}
            />
          </div>

          <div>
            <div className="about-side">
              <h4>{t.office}</h4>
              <ul>
                {t.officeItems.map(([label, value]) => (
                  <li key={label}>
                    <strong>{label}</strong>
                    <span>{value}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="section" style={{ paddingTop: 16 }}>
              <h3 style={{ fontSize: 15, marginBottom: 12 }}>{t.faqTitle}</h3>
              {t.faq.map(([question, answer], index) => (
                <details className="faq-item" key={question} open={index === 0}>
                  <summary>{question}</summary>
                  <p>
                    {index === 3 && locale === "zh" ? (
                      <>
                        可以，前往<Link href="/quote-cart">询价清单</Link>
                        页面，将产品加入清单后一次性提交。
                      </>
                    ) : (
                      answer
                    )}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
