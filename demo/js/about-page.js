/**
 * about-page.js —— 关于我们页 (about.html)
 * ----------------------------------------------------------------------------
 * 静态内容页，只负责初始化共用页头/页脚/面包屑。
 */
(async function initAboutPage() {
  await Promise.all([UI.renderHeader("about"), UI.renderFooter()]);
  UI.renderDataSourceBanner();

  UI.renderBreadcrumb("breadcrumb-mount", [
    { label: "首页", href: "index.html" },
    { label: "关于我们", href: "#" }
  ]);
})();
