import Link from "next/link";
import { notFound } from "next/navigation";

import { getCaseBySlug } from "@/features/cases/data";
import { getRequestDictionary } from "@/lib/i18n/server";

type CaseDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatPublishedDate(value: string | null, locale: "zh" | "en"): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(date);
}

export default async function CaseDetailPage({ params }: CaseDetailPageProps) {
  const { slug } = await params;
  const [caseItem, { dictionary, locale }] = await Promise.all([
    getCaseBySlug(slug),
    getRequestDictionary()
  ]);

  if (!caseItem) {
    notFound();
  }

  const t = dictionary.staticPages.cases;
  const common = dictionary.common;
  const publishedDate = formatPublishedDate(caseItem.publishedAt, locale);

  return (
    <>
      <nav className="breadcrumb container" aria-label="breadcrumb">
        <ol>
          <li>
            <Link href="/">{common.home}</Link>
          </li>
          <li>
            <Link href="/cases">{t.breadcrumb}</Link>
          </li>
          <li>{caseItem.title}</li>
        </ol>
      </nav>

      <div className="hero hero-compact">
        <div className="container hero-inner">
          <div className="hero-eyebrow">{caseItem.author || t.emptyTag}</div>
          <h1>{caseItem.title}</h1>
          {caseItem.summary ? <p>{caseItem.summary}</p> : null}
        </div>
      </div>

      <main className="container" style={{ paddingBottom: 64 }}>
        <section className="section case-detail" style={{ paddingTop: 32 }}>
          {publishedDate ? (
            <p className="text-muted" style={{ fontSize: 12.5, marginBottom: 20 }}>
              {t.detailPublishedLabel}
              {publishedDate}
            </p>
          ) : null}

          {caseItem.content ? (
            <div
              className="case-detail-content"
              dangerouslySetInnerHTML={{ __html: caseItem.content }}
            />
          ) : (
            <p className="text-muted">{t.detailNoContent}</p>
          )}

          {caseItem.coverImageUrl ? (
            <div className="case-detail-files">
              <h3 style={{ fontSize: 15, marginBottom: 12 }}>{t.detailFilesTitle}</h3>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt={caseItem.title} src={caseItem.coverImageUrl} />
            </div>
          ) : null}

          <Link className="case-detail-back" href="/cases">
            {t.backToList}
          </Link>
        </section>
      </main>
    </>
  );
}
