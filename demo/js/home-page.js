/**
 * home-page.js —— 首页 (index.html)
 * ----------------------------------------------------------------------------
 * 首页内容（公司介绍 / 视频占位 / 主推产品 / 联系我们 CTA）大部分是
 * 静态文案，直接写在 index.html 里；这个文件只负责两块"数据驱动"的区域：
 *   1. 视频区块：根据 config.js 是否配置了真实视频地址，切换"占位提示"还是
 *      "真实 <video> 播放器"。
 *   2. 主推产品：从 DataService 拉 is_featured = true 的产品，渲染成卡片。
 *
 * 2026-08：按需求移除了"应用场景"和"更多信息"两个静态区块，以及公司介绍
 * 里的第三段简介文字，让首页更聚焦；对应的 i18n 词条也一并清理掉了。
 */

(async function initHomePage() {
  await Promise.all([UI.renderHeader(""), UI.renderFooter()]);
  UI.renderDataSourceBanner();

  renderVideoSection();
  await renderFeaturedProducts();
  // 首页大段静态营销文案（Hero / 公司介绍 / 场景卡片等）用 data-i18n 标记在
  // index.html 里，这里统一扫描整个文档做一次替换——放在页头页脚渲染完之后，
  // 避免被 renderHeader/renderFooter 各自的局部 applyI18n 覆盖时序搞乱。
  I18N.applyI18n();

  function renderVideoSection() {
    const mount = document.getElementById("video-mount");
    const { INTRO_VIDEO_URL, INTRO_VIDEO_POSTER } = window.APP_CONFIG;

    if (INTRO_VIDEO_URL) {
      mount.innerHTML = `
        <div class="video-frame">
          <video controls preload="metadata" ${INTRO_VIDEO_POSTER ? `poster="${INTRO_VIDEO_POSTER}"` : ""}>
            <source src="${INTRO_VIDEO_URL}" />
            您的浏览器不支持内嵌视频播放，请直接下载查看：<a href="${INTRO_VIDEO_URL}">${INTRO_VIDEO_URL}</a>
          </video>
        </div>
      `;
      return;
    }

    // 还没有真实视频时的占位区：不报错、不留白，同时提示"怎么接入真实视频"，
    // 跟"数据来源提示条"是同一个设计思路——原型阶段任何还没接真实内容的地方，
    // 都清楚地告诉你"这是占位，怎么换成真的"。
    mount.innerHTML = `
      <div class="video-frame">
        <div class="video-placeholder">
          <div class="play-btn">▶</div>
          <p>公司介绍视频即将上线</p>
          <p class="hint">在 js/config.js 的 INTRO_VIDEO_URL 填上视频地址后，这里会自动替换成真实播放器</p>
        </div>
      </div>
    `;
  }

  async function renderFeaturedProducts() {
    const mount = document.getElementById("home-featured-grid");
    const featured = await DataService.getFeaturedProducts(6);

    if (!featured.length) {
      mount.innerHTML = `<p class="text-muted">暂无重点推荐产品。</p>`;
      return;
    }

    mount.innerHTML = featured
      .map(
        (product) => `
      <a class="product-card" href="product.html?slug=${encodeURIComponent(product.slug)}">
        <div class="thumb">
          <span class="badge badge-featured">重点推荐</span>
          <img src="${product.primaryImageUrl}" alt="${UI.escapeHtml(product.name)}" />
        </div>
        <div class="body">
          <span class="model-number">${UI.escapeHtml(product.modelNumber)}</span>
          <h3>${UI.escapeHtml(product.name)}</h3>
          <p class="summary">${UI.escapeHtml(product.summary || "")}</p>
          <div class="card-actions">
            <span class="btn btn-outline btn-sm">查看详情</span>
            <button
              type="button"
              class="btn btn-add-cart btn-sm"
              data-add-cart
              data-product-id="${product.id}"
              data-slug="${UI.escapeHtml(product.slug)}"
              data-model-number="${UI.escapeHtml(product.modelNumber)}"
              data-name="${UI.escapeHtml(product.name)}"
              data-category-name="${UI.escapeHtml(product.categoryName)}"
              data-image-url="${UI.escapeHtml(product.primaryImageUrl)}"
            >+ 加入清单</button>
          </div>
        </div>
      </a>
    `
      )
      .join("");
    UI.bindAddToCartButtons(mount);
  }
})();
