/**
 * ui-common.js
 * ----------------------------------------------------------------------------
 * 页头 / 页脚 / 面包屑等所有页面共用的 UI 片段，集中在这一个文件里渲染，
 * 每个页面（首页/产品中心/分类页/详情页/询价清单页/联系我们/行业应用/
 * 技术与服务/项目案例/资料中心/关于我们）就不用各自复制粘贴一份导航栏 HTML。
 * 每个 HTML 页面只需要放一个 <div id="site-header"></div> 和
 * <div id="site-footer"></div> 空容器，具体内容由这里的 JS 注入。
 *
 * 站点信息架构（按"网站原型图 2.pdf"确认）：
 *   首页 index.html
 *   产品中心 products.html（含分类落地页 category.html、详情页 product.html）
 *   行业应用 industries.html
 *   技术与服务 services.html
 *   项目案例 cases.html
 *   资料中心 resources.html
 *   关于我们 about.html
 *   联系我们 / 在线询价 contact.html
 *   询价清单（购物车） quote-cart.html
 */

const UI = (() => {
  function escapeHtml(value) {
    if (value === null || value === undefined) return "";
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatBytes(bytes) {
    if (!bytes) return "";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(0)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  }

  function debounce(fn, wait = 300) {
    let timer = null;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
  }

  function renderDataSourceBanner() {
    const banner = document.getElementById("data-source-banner");
    if (!banner) return;
    const lang = typeof I18N !== "undefined" ? I18N.getLang() : "zh";
    if (DataService.isLive) {
      banner.innerHTML =
        lang === "en"
          ? `<strong>Live data</strong> · This page is showing data from your real Supabase project`
          : `<strong>实时数据</strong> · 当前页面数据来自真实 Supabase 项目`;
    } else {
      banner.innerHTML =
        lang === "en"
          ? `<strong>Prototype demo data</strong> · This page shows the mock data in js/mock-data.js — fill in js/config.js to switch to real Supabase data`
          : `<strong>原型演示数据</strong> · 当前页面展示的是 js/mock-data.js 里的模拟数据，填好 js/config.js 后会自动切换成真实 Supabase 数据`;
    }
  }

  const NAV_ITEMS = [
    { key: "home", i18n: "nav.home", href: "index.html" },
    { key: "products", i18n: "nav.products", href: "products.html" },
    { key: "industries", i18n: "nav.industries", href: "industries.html" },
    { key: "services", i18n: "nav.services", href: "services.html" },
    { key: "cases", i18n: "nav.cases", href: "cases.html" },
    { key: "resources", i18n: "nav.resources", href: "resources.html" },
    { key: "about", i18n: "nav.about", href: "about.html" },
    { key: "contact", i18n: "nav.contact", href: "contact.html" }
  ];

  function updateCartBadge() {
    const badge = document.getElementById("cart-count-badge");
    if (!badge) return;
    const count = typeof QuoteCart !== "undefined" ? QuoteCart.count() : 0;
    badge.textContent = String(count);
    badge.style.display = count > 0 ? "inline-flex" : "none";
  }

  async function renderHeader(activeNav = "") {
    const mount = document.getElementById("site-header");
    if (!mount) return;

    const tree = await DataService.getCategoryTree();

    const megaColumns = tree
      .map(
        (top) => `
        <div class="mega-col">
          <div class="mega-col-title">
            <a href="category.html?slug=${encodeURIComponent(top.slug)}">${escapeHtml(top.name)}</a>
          </div>
          <ul>
            ${top.children
              .map(
                (child) => `
              <li><a href="products.html?category=${encodeURIComponent(child.slug)}">${escapeHtml(child.name)}</a></li>
            `
              )
              .join("")}
            <li><a href="category.html?slug=${encodeURIComponent(top.slug)}" style="font-weight:600;color:var(--primary-600);">查看全部 →</a></li>
          </ul>
        </div>`
      )
      .join("");

    const navHtml = NAV_ITEMS.map((item) => {
      if (item.key === "products") {
        return `
          <li class="${activeNav === "products" ? "active" : ""}">
            <a class="nav-link" href="${item.href}" tabindex="0" data-i18n="${item.i18n}">产品中心</a>
            <div class="mega-menu">${megaColumns}</div>
          </li>`;
      }
      return `<li class="${activeNav === item.key ? "active" : ""}"><a class="nav-link" href="${item.href}" data-i18n="${item.i18n}"></a></li>`;
    }).join("");

    const currentLang = typeof I18N !== "undefined" ? I18N.getLang() : "zh";
    const otherLangLabel = currentLang === "zh" ? "English" : "中文";

    mount.innerHTML = `
      <div class="topbar">
        <div class="container">
          <div class="topbar-links">
            <span><span data-i18n="common.hotlinePrefix"></span>${escapeHtml(window.APP_CONFIG.SERVICE_HOTLINE)}</span>
          </div>
          <div class="topbar-links">
            <button type="button" id="lang-toggle-btn" class="lang-toggle-btn">${escapeHtml(otherLangLabel)}</button>
          </div>
        </div>
      </div>
      <header class="site-header">
        <div class="container header-row-top">
          <a class="logo" href="index.html">
            <img class="logo-mark" src="assets/icons/logo-mark.svg" alt="${escapeHtml(window.APP_CONFIG.SITE_NAME)} logo" />
            <span>
              <span class="logo-text">${escapeHtml(window.APP_CONFIG.SITE_NAME)}</span>
              <span class="logo-sub">${escapeHtml(window.APP_CONFIG.SITE_NAME_EN)}</span>
            </span>
          </a>
          <div class="header-actions">
            <form class="header-search" id="header-search-form" role="search">
              <button type="submit" class="header-search-btn" aria-label="Search">🔍</button>
              <input type="search" id="header-search-input" data-i18n-placeholder="header.searchPlaceholder" />
            </form>
            <a class="btn btn-primary btn-sm cart-btn" href="quote-cart.html">
              <span data-i18n="header.cartBtn"></span>
              <span class="cart-count-badge" id="cart-count-badge" style="display:none;">0</span>
            </a>
          </div>
        </div>
        <nav class="main-nav-bar">
          <div class="container">
            <ul class="main-nav-list">${navHtml}</ul>
          </div>
        </nav>
      </header>
    `;

    updateCartBadge();
    if (typeof QuoteCart !== "undefined") {
      QuoteCart.onChange(updateCartBadge);
      window.addEventListener("quotecart:change", updateCartBadge);
    }

    const searchForm = document.getElementById("header-search-form");
    if (searchForm) {
      searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const keyword = document.getElementById("header-search-input").value.trim();
        window.location.href = keyword ? `products.html?q=${encodeURIComponent(keyword)}` : "products.html";
      });
    }

    const langBtn = document.getElementById("lang-toggle-btn");
    if (langBtn && typeof I18N !== "undefined") {
      langBtn.addEventListener("click", () => {
        I18N.setLang(currentLang === "zh" ? "en" : "zh");
      });
    }

    if (typeof I18N !== "undefined") I18N.applyI18n(mount);
  }

  function renderFooter() {
    const mount = document.getElementById("site-footer");
    if (!mount) return;

    mount.innerHTML = `
      <footer class="site-footer">
        <div class="container footer-top">
          <div class="footer-brand">
            <a class="logo" href="index.html">
              <img class="logo-mark" src="assets/icons/logo-mark.svg" alt="logo" />
              <span class="logo-text">${escapeHtml(window.APP_CONFIG.SITE_NAME)}</span>
            </a>
            <p data-i18n="footer.tagline"></p>
          </div>
          <div class="footer-col">
            <h4 data-i18n="footer.colProducts"></h4>
            <ul>
              <li><a href="category.html?slug=pipe-joining-solutions" data-i18n="footer.linkPipeJoining"></a></li>
              <li><a href="category.html?slug=fire-protection-solutions" data-i18n="footer.linkFireProtection"></a></li>
              <li><a href="products.html" data-i18n="footer.linkAllProducts"></a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4 data-i18n="footer.colSupport"></h4>
            <ul>
              <li><a href="industries.html" data-i18n="footer.linkIndustries"></a></li>
              <li><a href="services.html" data-i18n="footer.linkServices"></a></li>
              <li><a href="resources.html" data-i18n="footer.linkResources"></a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4 data-i18n="footer.colAbout"></h4>
            <ul>
              <li><a href="about.html" data-i18n="footer.linkCompanyProfile"></a></li>
              <li><a href="cases.html" data-i18n="footer.linkCases"></a></li>
              <li><a href="contact.html" data-i18n="footer.linkContact"></a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4 data-i18n="footer.colContact"></h4>
            <ul class="footer-contact-list">
              <li>
                <span class="footer-contact-label" data-i18n="footer.hotlineLabel"></span>
                <span class="footer-contact-value">${escapeHtml(window.APP_CONFIG.SERVICE_HOTLINE)}</span>
              </li>
              <li>
                <span class="footer-contact-label" data-i18n="footer.channelEmailLabel"></span>
                <span class="footer-contact-value">${escapeHtml(window.APP_CONFIG.SERVICE_EMAIL)}</span>
              </li>
              <li>
                <span class="footer-contact-label" data-i18n="footer.channelWechatLabel"></span>
                <span class="footer-contact-value" data-i18n="footer.channelWechatValue"></span>
              </li>
              <li class="footer-contact-cta">
                <a href="contact.html" data-i18n="footer.onlineInquiry"></a>
              </li>
            </ul>
            <p class="text-muted" style="font-size:12px;color:var(--neutral-400);margin-top:10px;" data-i18n="footer.responseNote"></p>
          </div>
        </div>
        <div class="container footer-bottom">
          <span>© 2026 ${escapeHtml(window.APP_CONFIG.SITE_NAME_FULL || window.APP_CONFIG.SITE_NAME)}. <span data-i18n="footer.copyrightSuffix"></span></span>
        </div>
      </footer>
    `;

    if (typeof I18N !== "undefined") I18N.applyI18n(mount);
  }

  /**
   * 给容器内所有 [data-add-cart] 按钮接上"加入询价清单"逻辑。
   * 产品卡片本身通常是一个整体可点击的 <a href="product.html?..."> 大卡片，
   * 所以这里必须 preventDefault + stopPropagation，否则点"+加入清单"会连带
   * 触发外层卡片的跳转——这是常见的"卡片内嵌按钮"交互坑。
   */
  function bindAddToCartButtons(scope = document) {
    scope.querySelectorAll("[data-add-cart]").forEach((btn) => {
      if (btn.dataset.cartBound) return;
      btn.dataset.cartBound = "1";
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (typeof QuoteCart === "undefined") return;
        QuoteCart.addItem({
          id: btn.dataset.productId,
          slug: btn.dataset.slug,
          modelNumber: btn.dataset.modelNumber,
          name: btn.dataset.name,
          categoryName: btn.dataset.categoryName,
          primaryImageUrl: btn.dataset.imageUrl
        });
        toast(`已加入询价清单：${btn.dataset.name}`);
        const originalText = btn.textContent;
        btn.classList.add("is-added");
        btn.textContent = "已加入 ✓";
        setTimeout(() => {
          btn.classList.remove("is-added");
          btn.textContent = originalText;
        }, 1400);
      });
    });
  }

  function renderBreadcrumb(mountId, items) {
    const mount = document.getElementById(mountId);
    if (!mount) return;
    mount.innerHTML = `
      <nav class="breadcrumb container" aria-label="breadcrumb">
        <ol>
          ${items
            .map((item, index) =>
              index === items.length - 1
                ? `<li>${escapeHtml(item.label)}</li>`
                : `<li><a href="${item.href}">${escapeHtml(item.label)}</a></li>`
            )
            .join("")}
        </ol>
      </nav>
    `;
  }

  /** 轻量提示条：加入清单/提交成功等场景使用，2.4 秒后自动消失 */
  function toast(message, tone = "success") {
    let host = document.getElementById("ui-toast-host");
    if (!host) {
      host = document.createElement("div");
      host.id = "ui-toast-host";
      host.className = "ui-toast-host";
      document.body.appendChild(host);
    }
    const el = document.createElement("div");
    el.className = `ui-toast ui-toast-${tone}`;
    el.textContent = message;
    host.appendChild(el);
    requestAnimationFrame(() => el.classList.add("is-visible"));
    setTimeout(() => {
      el.classList.remove("is-visible");
      setTimeout(() => el.remove(), 250);
    }, 2400);
  }

  return {
    escapeHtml,
    formatBytes,
    debounce,
    renderHeader,
    renderFooter,
    renderBreadcrumb,
    renderDataSourceBanner,
    updateCartBadge,
    bindAddToCartButtons,
    toast,
    NAV_ITEMS
  };
})();
