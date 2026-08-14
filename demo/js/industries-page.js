/**
 * industries-page.js —— 行业应用页 (industries.html)
 * ----------------------------------------------------------------------------
 * 内容目前是静态文案（写在 industries.html 里），这个文件只负责渲染共用的
 * 页头/页脚/面包屑，跟其他"以静态内容为主"的页面保持同样的初始化模式。
 */
(async function initIndustriesPage() {
  await Promise.all([UI.renderHeader("industries"), UI.renderFooter()]);
  UI.renderDataSourceBanner();

  UI.renderBreadcrumb("breadcrumb-mount", [
    { label: "首页", href: "index.html" },
    { label: "行业应用", href: "#" }
  ]);
})();
