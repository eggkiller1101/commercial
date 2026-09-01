import Link from "next/link";

import { InquiryForm } from "@/components/inquiry/inquiry-form";
import { WechatQrTrigger } from "@/components/common/wechat-qr-trigger";
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
            {t.channels.map(([icon, title, value, desc], index) => (
              <div className="contact-channel-card" key={title}>
                <div className="icon-wrap">{icon}</div>
                <h3>{title}</h3>
                {index === 2 ? (
                  <p>
                    <WechatQrTrigger
                      caption={common.wechatQrCaption}
                      closeLabel={common.wechatQrClose}
                      qrImageAlt={common.wechatQrAlt}
                      triggerLabel={value}
                    />
                  </p>
                ) : (
                  <p>{value}</p>
                )}
                <p className="text-muted" style={{ fontSize: 11.5, marginTop: 4 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          {/* 表单标题/说明放在两栏网格外面（单独占一整行），这样左边的表单卡片
              （.inquiry-card）和右边的办公信息卡片（.about-side）才能在网格里
              从同一条线开始，不会因为左边多了一段标题文字而比右边"矮"一截、
              显得右边的办公信息卡片好像飘得比表单靠上。 */}
          <h3 style={{ fontSize: 16, marginBottom: 8 }}>{t.formTitle}</h3>
          <p className="text-muted" style={{ fontSize: 13, marginBottom: 24 }}>
            {t.formDesc}
          </p>

          <div className="contact-form-grid">
            <InquiryForm
              defaultMessage={productId ? `${t.consultProduct}${productId}` : ""}
              locale={locale}
              productId={productId}
              submitLabel={t.submitLabel}
            />

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
          </div>
        </section>
      </main>
    </>
  );
}
