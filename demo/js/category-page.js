/**
 * category-page.js —— 分类落地页 (category.html?slug=xxx)
 * ----------------------------------------------------------------------------
 * 定位：大分类的"入口页"，不直接罗列全部产品（那是 products.html 的职责），
 * 而是先展示这个大类下有哪些子分类、有哪些重点推荐产品，引导用户再往下钻。
 * 对应 Victaulic /products/ 里"Pipe Joining"这种大类页面的角色。
 */

(async function initCategoryPage() {
  await Promise.all([UI.renderHeader("products"), UI.renderFooter()]);
  UI.renderDataSourceBanner();

  const params = new URLSearchParams(location.search);
  const slug = params.get("slug");

  const category = slug ? await DataService.getCategoryBySlug(slug) : null;

  if (!category) {
    document.getElementById("category-main").innerHTML = `
      <div class="empty-state">
        <div class="icon">🗂️</div>
        <p>没有找到这个分类，返回<a href="products.html" style="color:var(--primary-600);font-weight:600;">产品中心</a>看看？</p>
      </div>`;
    return;
  }

  UI.renderBreadcrumb("breadcrumb-mount", [
    { label: "首页", href: "index.html" },
    { label: "产品中心", href: "products.html" },
    ...category.breadcrumb.map((c) => ({ label: c.name, href: `category.html?slug=${encodeURIComponent(c.slug)}` }))
  ]);

  document.title = `${category.name} - 云工智上`;

  renderHero(category);
  renderSubcategories(category);
  renderFeatured(category);

  function renderHero(category) {
    document.getElementById("category-hero").innerHTML = `
      <div class="hero hero-compact">
        <div class="container hero-inner">
          <div class="hero-eyebrow">产品中心</div>
          <h1>${UI.escapeHtml(category.name)}</h1>
          <p>${UI.escapeHtml(category.description || "")}</p>
          <div class="hero-actions">
            <a class="btn btn-secondary" href="products.html?category=${encodeURIComponent(category.slug)}">浏览全部产品（${category.productCount}）</a>
            <a class="btn btn-outline" style="background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.4);color:#fff;" href="#contact-cta">获取选型建议</a>
          </div>
        </div>
      </div>
    `;
  }

  function renderSubcategories(category) {
    const mount = document.getElementById("subcategory-section");
    if (!category.children.length) {
      mount.innerHTML = "";
      return;
    }

    mount.innerHTML = `
      <div class="section-head">
        <div>
          <h2>子分类</h2>
          <p>选择下面的子分类，快速定位到具体产品系列</p>
        </div>
      </div>
      <div class="subcategory-grid">
        ${category.children
          .map(
            (child) => `
          <a class="subcategory-card" href="products.html?category=${encodeURIComponent(child.slug)}">
            <div class="icon-wrap"><img src="${child.icon_url || "assets/icons/generic-product.svg"}" alt="" /></div>
            <h3>${UI.escapeHtml(child.name)}</h3>
            <p>${UI.escapeHtml(child.description || "")}</p>
            <span class="card-link">查看产品 →</span>
          </a>
        `
          )
          .join("")}
      </div>
    `;
  }

  function renderFeatured(category) {
    const mount = document.getElementById("featured-section");
    if (!category.featuredProducts.length) {
      mount.innerHTML = "";
      return;
    }

    mount.innerHTML = `
      <div class="section-head">
        <div>
          <h2>重点推荐</h2>
          <p>该分类下的重点产品</p>
        </div>
        <a class="view-all" href="products.html?category=${encodeURIComponent(category.slug)}">查看全部 →</a>
      </div>
      <div class="product-grid">
        ${category.featuredProducts
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
                  data-category-name="${UI.escapeHtml(category.name)}"
                  data-image-url="${UI.escapeHtml(product.primaryImageUrl)}"
                >+ 加入清单</button>
              </div>
            </div>
          </a>
        `
          )
          .join("")}
      </div>
    `;
    UI.bindAddToCartButtons(mount);
  }
})();
