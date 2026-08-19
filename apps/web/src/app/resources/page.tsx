import Link from "next/link";

import { getPublishedDocuments } from "@/features/documents/data";
import { getRequestDictionary } from "@/lib/i18n/server";

export default async function ResourcesPage() {
  const [{ dictionary }, documents] = await Promise.all([
    getRequestDictionary(),
    getPublishedDocuments()
  ]);
  const t = dictionary.resources;
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
          <div className="hero-eyebrow">{t.eyebrow}</div>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
      </div>

      <main className="container" style={{ paddingBottom: 64 }}>
        <section className="section" style={{ paddingTop: 20 }}>
          <div className="resource-filter-bar">
            <button className="is-active" type="button">
              {t.all}
            </button>
            <button type="button">{t.pdf}</button>
          </div>

          <div className="resource-list">
            <ul className="doc-list">
              {documents.length ? (
                documents.map((document) => (
                  <li key={document.id}>
                    <div className="doc-info">
                      <span className="doc-icon">
                        {(document.fileType || "FILE").toUpperCase()}
                      </span>
                      <div>
                        <div className="doc-name">{document.title}</div>
                        <div className="doc-meta">
                          {document.language}
                          {document.version ? ` · ${document.version}` : ""}
                        </div>
                      </div>
                    </div>
                    {document.fileUrl ? (
                      <a
                        className="btn btn-outline btn-sm"
                        href={document.fileUrl}
                        rel="noopener"
                        target="_blank"
                      >
                        {common.download}
                      </a>
                    ) : (
                      <span className="text-muted">{common.noFile}</span>
                    )}
                  </li>
                ))
              ) : (
                <li>
                  <div className="empty-state" style={{ width: "100%" }}>
                    <div className="icon">📄</div>
                    <p>{t.empty}</p>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}
