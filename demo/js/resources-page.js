/**
 * resources-page.js —— 资料中心页 (resources.html)
 * ----------------------------------------------------------------------------
 * 数据来自 DataService.getAllDocuments()：把所有产品挂载的技术文档拍平成
 * 一个列表。这样资料中心不需要单独维护一份文档数据，产品详情页新增文档后，
 * 这里会自动出现——跟"分类树状图"是同一个"从既有数据派生视图"的思路。
 */
(async function initResourcesPage() {
  await Promise.all([UI.renderHeader("resources"), UI.renderFooter()]);
  UI.renderDataSourceBanner();

  UI.renderBreadcrumb("breadcrumb-mount", [
    { label: "首页", href: "index.html" },
    { label: "资料中心", href: "#" }
  ]);

  const docs = await DataService.getAllDocuments();
  let activeFilter = "all";
  render();

  document.getElementById("resource-filter-bar").querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeFilter = btn.dataset.filter;
      document.querySelectorAll("#resource-filter-bar button").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      render();
    });
  });

  function render() {
    const mount = document.getElementById("resource-doc-list");
    const list = activeFilter === "all" ? docs : docs.filter((d) => (d.file_type || "").toLowerCase() === activeFilter);

    if (!list.length) {
      mount.innerHTML = `<li style="justify-content:center;color:var(--color-text-muted);">暂无匹配的技术资料</li>`;
      return;
    }

    mount.innerHTML = list
      .map(
        (doc) => `
      <li>
        <div class="doc-info">
          <span class="doc-icon">${UI.escapeHtml((doc.file_type || "FILE").toUpperCase())}</span>
          <div>
            <div class="doc-name">${UI.escapeHtml(doc.title)}</div>
            <div class="doc-meta">${UI.escapeHtml(doc.categoryName)} · ${UI.escapeHtml(doc.productName)} · ${UI.formatBytes(doc.file_size_bytes)}</div>
          </div>
        </div>
        <div style="display:flex;gap:8px;">
          <a class="btn btn-outline btn-sm" href="product.html?slug=${encodeURIComponent(doc.productSlug)}">查看产品</a>
          <a class="btn btn-outline btn-sm" href="${doc.file_url}" target="_blank" rel="noopener">下载</a>
        </div>
      </li>`
      )
      .join("");
  }
})();
