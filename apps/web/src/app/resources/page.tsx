import Link from "next/link";

import { getPublishedDocuments } from "@/features/documents/data";

export default async function ResourcesPage() {
  const documents = await getPublishedDocuments();

  return (
    <>
      <nav className="breadcrumb container" aria-label="breadcrumb">
        <ol>
          <li>
            <Link href="/">首页</Link>
          </li>
          <li>资料中心</li>
        </ol>
      </nav>

      <div className="hero hero-compact">
        <div className="container hero-inner">
          <div className="hero-eyebrow">资料中心</div>
          <h1>产品说明书、安装指南与认证证书下载</h1>
          <p>资料来自各产品详情页挂载的技术文档，随产品数据自动同步更新。</p>
        </div>
      </div>

      <main className="container" style={{ paddingBottom: 64 }}>
        <section className="section" style={{ paddingTop: 20 }}>
          <div className="resource-filter-bar">
            <button className="is-active" type="button">
              全部资料
            </button>
            <button type="button">PDF 文档</button>
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
                        下载
                      </a>
                    ) : (
                      <span className="text-muted">暂无文件</span>
                    )}
                  </li>
                ))
              ) : (
                <li>
                  <div className="empty-state" style={{ width: "100%" }}>
                    <div className="icon">📄</div>
                    <p>暂无资料文件</p>
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
