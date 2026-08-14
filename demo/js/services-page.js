/**
 * services-page.js —— 技术与服务页 (services.html)
 * ----------------------------------------------------------------------------
 * 静态内容页，只负责初始化共用页头/页脚/面包屑。
 */
(async function initServicesPage() {
  await Promise.all([UI.renderHeader("services"), UI.renderFooter()]);
  UI.renderDataSourceBanner();

  UI.renderBreadcrumb("breadcrumb-mount", [
    { label: "首页", href: "index.html" },
    { label: "技术与服务", href: "#" }
  ]);
})();
