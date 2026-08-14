/**
 * product-page.js —— 产品详情页 (product.html?slug=xxx)
 * ----------------------------------------------------------------------------
 * 对应 CMS 里 getProductById() 返回的详情结构，只是这里读到的是"给访客看"的
 * 视图（图库、技术参数表、规格型号、资料下载、询价表单），而不是编辑表单。
 */

(async function initProductPage() {
  await Promise.all([UI.renderHeader("products"), UI.renderFooter()]);
  UI.renderDataSourceBanner();

  const params = new URLSearchParams(location.search);
  const slug = params.get("slug");
  const product = slug ? await DataService.getProductBySlug(slug) : null;

  if (!product) {
    document.getElementById("product-main").innerHTML = `
      <div class="container">
        <div class="empty-state">
          <div class="icon">📦</div>
          <p>没有找到这个产品，返回<a href="products.html" style="color:var(--primary-600);font-weight:600;">产品中心</a>看看？</p>
        </div>
      </div>`;
    return;
  }

  document.title = `${product.name} (${product.modelNumber}) - 云工智上`;

  UI.renderBreadcrumb("breadcrumb-mount", [
    { label: "首页", href: "index.html" },
    { label: "产品中心", href: "products.html" },
    { label: product.categoryName, href: `products.html?category=${encodeURIComponent(product.categorySlug)}` },
    { label: product.name, href: "#" }
  ]);

  renderOverview(product);
  renderTabs(product);
  await renderRelated(product);
  bindInquiryForm(product);

  function renderOverview(product) {
    const images = product.images;
    document.getElementById("gallery").innerHTML = `
      <div class="gallery-main" id="gallery-main">
        <img src="${images[0].image_url}" alt="${UI.escapeHtml(images[0].alt_text || product.name)}" id="gallery-main-img" />
      </div>
      ${
        images.length > 1
          ? `<div class="gallery-thumbs">
        ${images
          .map(
            (img, index) => `
          <button class="thumb ${index === 0 ? "is-active" : ""}" data-src="${img.image_url}" data-alt="${UI.escapeHtml(img.alt_text || product.name)}">
            <img src="${img.image_url}" alt="" />
          </button>`
          )
          .join("")}
      </div>`
          : ""
      }
    `;

    document.querySelectorAll(".gallery-thumbs .thumb").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.getElementById("gallery-main-img").src = btn.dataset.src;
        document.getElementById("gallery-main-img").alt = btn.dataset.alt;
        document.querySelectorAll(".gallery-thumbs .thumb").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
      });
    });

    const highlightSpecs = product.specs.slice(0, 4);

    document.getElementById("product-info").innerHTML = `
      <div class="product-meta-row">
        <span class="badge badge-category">${UI.escapeHtml(product.categoryName)}</span>
        ${product.isFeatured ? `<span class="badge badge-featured">重点推荐</span>` : ""}
        <span class="badge badge-outline">浏览 ${product.viewCount}</span>
      </div>
      <h1 class="product-title">${UI.escapeHtml(product.name)}</h1>
      <p class="text-muted" style="font-size:13px;">型号 / Style：<strong style="color:var(--primary-700);">${UI.escapeHtml(product.modelNumber)}</strong></p>
      <p style="margin-top:14px;">${UI.escapeHtml(product.summary || "")}</p>

      ${
        highlightSpecs.length
          ? `<dl class="spec-highlights">
        ${highlightSpecs
          .map(
            (spec) => `
          <div>
            <dt>${UI.escapeHtml(spec.name)}</dt>
            <dd>${UI.escapeHtml(spec.value)}${spec.unit ? ` ${UI.escapeHtml(spec.unit)}` : ""}</dd>
          </div>`
          )
          .join("")}
      </dl>`
          : ""
      }

      <div class="detail-actions">
        <div class="qty-stepper" id="detail-qty-stepper">
          <button type="button" data-step="-1" aria-label="减少数量">−</button>
          <input type="number" id="detail-qty-input" value="1" min="1" />
          <button type="button" data-step="1" aria-label="增加数量">+</button>
        </div>
        <button type="button" class="btn btn-primary" id="detail-add-cart-btn">+ 加入询价清单</button>
        <a class="btn btn-outline" href="#inquiry">直接提交询价</a>
        <button type="button" class="btn btn-outline" id="jump-to-documents">下载技术资料</button>
      </div>
    `;

    document.getElementById("jump-to-documents").addEventListener("click", () => {
      document.getElementById("tabs-section").scrollIntoView({ behavior: "smooth", block: "start" });
      const docTabBtn = document.querySelector('#tabs-nav button[data-tab="documents"]');
      if (docTabBtn) docTabBtn.click();
    });

    const qtyInput = document.getElementById("detail-qty-input");
    document.getElementById("detail-qty-stepper").querySelectorAll("button[data-step]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const next = Math.max(1, (Number(qtyInput.value) || 1) + Number(btn.dataset.step));
        qtyInput.value = next;
      });
    });

    document.getElementById("detail-add-cart-btn").addEventListener("click", () => {
      const quantity = Math.max(1, Number(qtyInput.value) || 1);
      QuoteCart.addItem(
        {
          id: product.id,
          slug: product.slug,
          modelNumber: product.modelNumber,
          name: product.name,
          categoryName: product.categoryName,
          primaryImageUrl: product.images[0].image_url
        },
        quantity
      );
      UI.toast(`已加入询价清单：${product.name} × ${quantity}`);
    });
  }

  function renderTabs(product) {
    const tabs = [
      { key: "description", label: "产品描述" },
      { key: "specs", label: "技术参数" },
      { key: "variants", label: "规格型号" },
      { key: "documents", label: "相关文档" }
    ];

    document.getElementById("tabs-nav").innerHTML = tabs
      .map((tab, index) => `<button data-tab="${tab.key}" class="${index === 0 ? "is-active" : ""}">${tab.label}</button>`)
      .join("");

    document.getElementById("tabs-content").innerHTML = `
      <div class="tab-panel is-active" data-tab="description">
        <div class="prose">
          <p>${UI.escapeHtml(product.description || "暂无详细描述。")}</p>
          ${product.applicationNotes ? `<p><strong>适用场景/安装注意：</strong>${UI.escapeHtml(product.applicationNotes)}</p>` : ""}
        </div>
      </div>

      <div class="tab-panel" data-tab="specs">
        ${
          product.specs.length
            ? `<table class="spec-table">
          ${product.specs
            .map(
              (spec) => `
            <tr><th>${UI.escapeHtml(spec.name)}</th><td>${UI.escapeHtml(spec.value)}${spec.unit ? ` ${UI.escapeHtml(spec.unit)}` : ""}</td></tr>
          `
            )
            .join("")}
        </table>`
            : `<p class="text-muted">暂无技术参数。</p>`
        }
      </div>

      <div class="tab-panel" data-tab="variants">
        ${
          product.variants.length
            ? `<table class="variant-table">
          <thead><tr><th>SKU</th><th>规格名称</th><th>其他参数</th></tr></thead>
          <tbody>
            ${product.variants
              .map(
                (v) => `
              <tr>
                <td>${UI.escapeHtml(v.sku)}</td>
                <td>${UI.escapeHtml(v.variant_name)}</td>
                <td>${
                  v.extra_attributes && Object.keys(v.extra_attributes).length
                    ? Object.entries(v.extra_attributes)
                        .map(([k, val]) => `${UI.escapeHtml(k)}: ${UI.escapeHtml(val)}`)
                        .join("；")
                    : "—"
                }</td>
              </tr>`
              )
              .join("")}
          </tbody>
        </table>`
            : `<p class="text-muted">暂无规格型号数据。</p>`
        }
      </div>

      <div class="tab-panel" data-tab="documents">
        ${
          product.documents.length
            ? `<ul class="doc-list">
          ${product.documents
            .map(
              (doc) => `
            <li>
              <div class="doc-info">
                <span class="doc-icon">${UI.escapeHtml((doc.file_type || "FILE").toUpperCase())}</span>
                <div>
                  <div class="doc-name">${UI.escapeHtml(doc.title)}</div>
                  <div class="doc-meta">${UI.formatBytes(doc.file_size_bytes)}</div>
                </div>
              </div>
              <a class="btn btn-outline btn-sm" href="${doc.file_url}" target="_blank" rel="noopener">下载</a>
            </li>`
            )
            .join("")}
        </ul>`
            : `<p class="text-muted">暂无可下载的技术文档。</p>`
        }
      </div>
    `;

    document.getElementById("tabs-nav").querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.getElementById("tabs-nav").querySelectorAll("button").forEach((b) => b.classList.remove("is-active"));
        document.getElementById("tabs-content").querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("is-active"));
        btn.classList.add("is-active");
        document.getElementById("tabs-content").querySelector(`.tab-panel[data-tab="${btn.dataset.tab}"]`).classList.add("is-active");
      });
    });
  }

  async function renderRelated(product) {
    const related = await DataService.getRelatedProducts(product.categoryId, product.id, 4);
    const mount = document.getElementById("related-section");
    if (!related.length) {
      mount.innerHTML = "";
      return;
    }
    mount.innerHTML = `
      <div class="section-head">
        <div><h2>相关产品</h2></div>
      </div>
      <div class="product-grid">
        ${related
          .map(
            (p) => `
          <a class="product-card" href="product.html?slug=${encodeURIComponent(p.slug)}">
            <div class="thumb"><img src="${p.primaryImageUrl}" alt="${UI.escapeHtml(p.name)}" /></div>
            <div class="body">
              <span class="model-number">${UI.escapeHtml(p.modelNumber)}</span>
              <h3>${UI.escapeHtml(p.name)}</h3>
              <p class="summary">${UI.escapeHtml(p.summary || "")}</p>
            </div>
          </a>`
          )
          .join("")}
      </div>
    `;
  }

  function bindInquiryForm(product) {
    document.getElementById("inquiry-product-name").textContent = `${product.name}（${product.modelNumber}）`;
    const form = document.getElementById("inquiry-form");
    const feedback = document.getElementById("inquiry-feedback");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      feedback.className = "form-feedback";
      const submitBtn = form.querySelector("button[type=submit]");
      submitBtn.disabled = true;
      submitBtn.textContent = "提交中...";

      const formData = new FormData(form);
      const payload = {
        name: formData.get("name"),
        company: formData.get("company"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        message: formData.get("message"),
        productId: product.id
      };

      const result = await DataService.submitInquiry(payload);

      submitBtn.disabled = false;
      submitBtn.textContent = "提交询价";

      if (result.ok) {
        feedback.textContent = "提交成功，我们的工程师会尽快与您联系。";
        feedback.className = "form-feedback is-success";
        form.reset();
      } else {
        feedback.textContent = `提交失败：${result.message || "请稍后重试"}`;
        feedback.className = "form-feedback is-error";
      }
    });
  }
})();
