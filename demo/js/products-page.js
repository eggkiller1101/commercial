/**
 * products-page.js —— 产品列表页 (products.html)
 * ----------------------------------------------------------------------------
 * 对标 Victaulic /products/ 的核心交互：左侧分类树 + 按分类动态出现的规格
 * 筛选器，右侧结果按关键字/排序/分页展示。
 *
 * 页面状态（分类、筛选条件、排序、页码、搜索词）全部同步进 URL query string，
 * 这样用户可以直接分享/收藏某个筛选结果的链接，刷新页面也不会丢状态——
 * 这是电商/产品目录类页面的标准做法。
 */

(async function initProductsPage() {
  await Promise.all([UI.renderHeader("products"), UI.renderFooter()]);
  UI.renderDataSourceBanner();

  const state = readStateFromUrl();

  const [tree] = await Promise.all([DataService.getCategoryTree()]);
  renderSidebarCategoryTree(tree, state.categorySlug);
  await renderAttrFilterPanel(tree, state);
  renderBreadcrumbFor(state.categorySlug);
  await renderTreeDiagram();
  I18N.applyI18n();

  bindToolbar(state);

  await refreshResults(state);

  /**
   * 产品中心树状图：categories → subcategories → products 数量统计。
   * 只在没有筛选任何分类的"全部产品"视图下展示（进入某个具体分类后，
   * 左侧分类树 + 顶部面包屑已经足够定位，树状图更适合作为"总览入口"）。
   */
  async function renderTreeDiagram() {
    const mount = document.getElementById("category-tree-diagram");
    if (!mount) return;

    const treeWithCounts = await DataService.getCategoryTreeWithCounts();
    const totalProducts = treeWithCounts.reduce((sum, t) => sum + t.productCount, 0);

    mount.innerHTML = `
      <div class="tree-diagram-head">
        <div>
          <h2>产品分类总览</h2>
          <p data-i18n="products.treeSub">点击任意节点直接进入该分类</p>
        </div>
        <div class="tree-diagram-legend">
          <span><span class="dot l1"></span>大类</span>
          <span><span class="dot l2"></span>子类</span>
        </div>
      </div>
      <ul class="org-tree">
        <li>
          <a class="tree-node tree-node-root" href="products.html">
            全部产品 <span class="tree-node-count">${totalProducts}</span>
          </a>
          <ul>
            ${treeWithCounts
              .map(
                (top) => `
              <li>
                <a class="tree-node tree-node-l1" href="category.html?slug=${encodeURIComponent(top.slug)}">
                  ${UI.escapeHtml(top.name)} <span class="tree-node-count">${top.productCount}</span>
                </a>
                ${
                  top.children.length
                    ? `<ul>
                  ${top.children
                    .map(
                      (child) => `
                    <li>
                      <a class="tree-node tree-node-l2 ${child.productCount === 0 ? "is-empty" : ""}" href="products.html?category=${encodeURIComponent(child.slug)}">
                        ${UI.escapeHtml(child.name)} <span class="tree-node-count">${child.productCount}</span>
                      </a>
                    </li>
                  `
                    )
                    .join("")}
                </ul>`
                    : ""
                }
              </li>
            `
              )
              .join("")}
          </ul>
        </li>
      </ul>
    `;
  }

  function renderBreadcrumbFor(categorySlug) {
    const items = [
      { label: "首页", href: "index.html" },
      { label: "产品中心", href: "products.html" }
    ];
    const node = categorySlug ? findCategoryNode(tree, categorySlug) : null;
    if (node) {
      if (node.parent_id) {
        const parent = tree.find((t) => t.children.some((c) => c.slug === node.slug));
        if (parent) items.push({ label: parent.name, href: `category.html?slug=${encodeURIComponent(parent.slug)}` });
      }
      items.push({ label: node.name, href: `category.html?slug=${encodeURIComponent(node.slug)}` });
    }
    UI.renderBreadcrumb("breadcrumb-mount", items);
  }

  // ---------------------------------------------------------------------
  function readStateFromUrl() {
    const params = new URLSearchParams(location.search);
    const attrFilters = {};
    params.forEach((value, key) => {
      if (key.startsWith("attr_")) {
        const code = key.replace("attr_", "");
        try {
          attrFilters[code] = JSON.parse(value);
        } catch (e) {
          attrFilters[code] = value;
        }
      }
    });

    return {
      categorySlug: params.get("category") || null,
      keyword: params.get("q") || "",
      sort: params.get("sort") || "newest",
      page: Number(params.get("page")) || 1,
      attrFilters
    };
  }

  function writeStateToUrl(nextState) {
    const params = new URLSearchParams();
    if (nextState.categorySlug) params.set("category", nextState.categorySlug);
    if (nextState.keyword) params.set("q", nextState.keyword);
    if (nextState.sort && nextState.sort !== "newest") params.set("sort", nextState.sort);
    if (nextState.page && nextState.page !== 1) params.set("page", String(nextState.page));
    Object.entries(nextState.attrFilters || {}).forEach(([code, value]) => {
      const isEmpty = value === undefined || value === null || (Array.isArray(value) && value.length === 0);
      if (!isEmpty) params.set(`attr_${code}`, JSON.stringify(value));
    });
    const query = params.toString();
    history.replaceState(null, "", query ? `products.html?${query}` : "products.html");
  }

  function findCategoryNode(tree, slug) {
    for (const top of tree) {
      if (top.slug === slug) return top;
      const child = top.children.find((c) => c.slug === slug);
      if (child) return child;
    }
    return null;
  }

  function renderSidebarCategoryTree(tree, activeSlug) {
    const mount = document.getElementById("category-tree");
    mount.innerHTML = `
      <ul class="category-tree">
        <li><a href="products.html" class="${!activeSlug ? "is-active" : ""}" data-slug="">全部产品</a></li>
        ${tree
          .map(
            (top) => `
          <li>
            <a href="products.html?category=${encodeURIComponent(top.slug)}" class="${activeSlug === top.slug ? "is-active" : ""}" data-slug="${top.slug}">
              ${UI.escapeHtml(top.name)}
            </a>
            <ul class="children">
              ${top.children
                .map(
                  (child) => `
                <li><a href="products.html?category=${encodeURIComponent(child.slug)}" class="${activeSlug === child.slug ? "is-active" : ""}" data-slug="${child.slug}">${UI.escapeHtml(child.name)}</a></li>
              `
                )
                .join("")}
            </ul>
          </li>
        `
          )
          .join("")}
      </ul>
    `;

    mount.querySelectorAll("a[data-slug]").forEach((link) => {
      link.addEventListener("click", async (event) => {
        event.preventDefault();
        const slug = link.dataset.slug || null;
        state.categorySlug = slug;
        state.page = 1;
        state.attrFilters = {}; // 换分类后，上一个分类的规格筛选条件不再适用
        writeStateToUrl(state);
        renderSidebarCategoryTree(tree, slug);
        await renderAttrFilterPanel(tree, state);
        renderBreadcrumbFor(slug);
        await refreshResults(state);
      });
    });
  }

  async function renderAttrFilterPanel(tree, currentState) {
    const mount = document.getElementById("attr-filter-panel");
    const node = currentState.categorySlug ? findCategoryNode(tree, currentState.categorySlug) : null;

    if (!node) {
      mount.innerHTML = "";
      return;
    }

    const defs = await DataService.getFilterableAttributeDefs(node.id);
    if (!defs.length) {
      mount.innerHTML = "";
      return;
    }

    const groupsHtml = await Promise.all(
      defs.map(async (def) => {
        if (def.data_type === "number") {
          const current = currentState.attrFilters[def.code] || {};
          return `
            <div class="attr-filter-group" data-code="${def.code}" data-type="number">
              <div class="attr-name">${UI.escapeHtml(def.name)} <span class="attr-unit">${UI.escapeHtml(def.unit || "")}</span></div>
              <div class="range-inputs">
                <input type="number" placeholder="最小" class="attr-min" value="${current.min ?? ""}" />
                <span>—</span>
                <input type="number" placeholder="最大" class="attr-max" value="${current.max ?? ""}" />
              </div>
            </div>`;
        }

        const options = await DataService.getAttributeOptions(node.id, def.code);
        const selected = new Set(currentState.attrFilters[def.code] || []);
        return `
          <div class="attr-filter-group" data-code="${def.code}" data-type="enum">
            <div class="attr-name">${UI.escapeHtml(def.name)}</div>
            ${options
              .map(
                (opt) => `
              <label class="checkbox-row">
                <input type="checkbox" value="${UI.escapeHtml(opt)}" ${selected.has(opt) ? "checked" : ""} />
                ${UI.escapeHtml(opt)}
              </label>`
              )
              .join("")}
          </div>`;
      })
    );

    mount.innerHTML = `
      <div class="filter-panel">
        <h4>按技术参数筛选</h4>
        ${groupsHtml.join("")}
        <button type="button" class="filter-reset" id="attr-filter-reset">清除全部筛选</button>
      </div>
    `;

    mount.querySelectorAll(".attr-filter-group").forEach((group) => {
      const code = group.dataset.code;
      if (group.dataset.type === "number") {
        const apply = UI.debounce(async () => {
          const min = group.querySelector(".attr-min").value;
          const max = group.querySelector(".attr-max").value;
          if (!min && !max) {
            delete state.attrFilters[code];
          } else {
            state.attrFilters[code] = { min: min || undefined, max: max || undefined };
          }
          state.page = 1;
          writeStateToUrl(state);
          await refreshResults(state);
        }, 400);
        group.querySelectorAll("input").forEach((input) => input.addEventListener("input", apply));
      } else {
        group.querySelectorAll("input[type=checkbox]").forEach((checkbox) => {
          checkbox.addEventListener("change", async () => {
            const checked = Array.from(group.querySelectorAll("input[type=checkbox]:checked")).map((i) => i.value);
            if (checked.length) {
              state.attrFilters[code] = checked;
            } else {
              delete state.attrFilters[code];
            }
            state.page = 1;
            writeStateToUrl(state);
            await refreshResults(state);
          });
        });
      }
    });

    const resetBtn = document.getElementById("attr-filter-reset");
    if (resetBtn) {
      resetBtn.addEventListener("click", async () => {
        state.attrFilters = {};
        state.page = 1;
        writeStateToUrl(state);
        await renderAttrFilterPanel(tree, state);
        await refreshResults(state);
      });
    }
  }

  function bindToolbar(currentState) {
    const searchInput = document.getElementById("search-input");
    searchInput.value = currentState.keyword;
    searchInput.addEventListener(
      "input",
      UI.debounce(async () => {
        state.keyword = searchInput.value;
        state.page = 1;
        writeStateToUrl(state);
        await refreshResults(state);
      }, 350)
    );

    const sortSelect = document.getElementById("sort-select");
    sortSelect.value = currentState.sort;
    sortSelect.addEventListener("change", async () => {
      state.sort = sortSelect.value;
      state.page = 1;
      writeStateToUrl(state);
      await refreshResults(state);
    });
  }

  function renderActiveFilterChips(currentState, attributeDefsByCode) {
    const mount = document.getElementById("active-filters");
    const chips = [];

    Object.entries(currentState.attrFilters || {}).forEach(([code, value]) => {
      const def = attributeDefsByCode.get(code);
      const label = def ? def.name : code;
      if (Array.isArray(value)) {
        value.forEach((v) => chips.push({ key: `${code}:${v}`, text: `${label}：${v}`, onRemove: () => removeEnumFilterValue(code, v) }));
      } else if (value && (value.min || value.max)) {
        const rangeText = `${value.min || "不限"} - ${value.max || "不限"}${def && def.unit ? def.unit : ""}`;
        chips.push({ key: code, text: `${label}：${rangeText}`, onRemove: () => removeFilter(code) });
      }
    });

    if (!chips.length) {
      mount.innerHTML = "";
      return;
    }

    mount.innerHTML = chips
      .map((chip) => `<span class="filter-chip" data-key="${UI.escapeHtml(chip.key)}">${UI.escapeHtml(chip.text)} <button aria-label="移除">✕</button></span>`)
      .join("");

    mount.querySelectorAll(".filter-chip").forEach((chipEl, index) => {
      chipEl.querySelector("button").addEventListener("click", async () => {
        chips[index].onRemove();
        state.page = 1;
        writeStateToUrl(state);
        const tree2 = await DataService.getCategoryTree();
        await renderAttrFilterPanel(tree2, state);
        await refreshResults(state);
      });
    });

    function removeFilter(code) {
      delete state.attrFilters[code];
    }
    function removeEnumFilterValue(code, value) {
      state.attrFilters[code] = (state.attrFilters[code] || []).filter((v) => v !== value);
      if (!state.attrFilters[code].length) delete state.attrFilters[code];
    }
  }

  async function refreshResults(currentState) {
    const grid = document.getElementById("product-grid");
    grid.innerHTML = `<div class="skeleton" style="grid-column:1/-1;height:220px;"></div>`;

    const attributeDefs = await DataService.getFilterableAttributeDefs(
      currentState.categorySlug ? (findCategoryNode(tree, currentState.categorySlug) || {}).id : null
    );
    renderActiveFilterChips(currentState, new Map(attributeDefs.map((d) => [d.code, d])));

    const result = await DataService.getProducts(currentState);

    const searchBanner = document.getElementById("search-keyword-banner");
    if (searchBanner) {
      if (currentState.keyword && currentState.keyword.trim()) {
        searchBanner.style.display = "block";
        searchBanner.innerHTML = `为你找到 <strong>${result.total}</strong> 条与 “${UI.escapeHtml(currentState.keyword.trim())}” 相关的产品`;
      } else {
        searchBanner.style.display = "none";
        searchBanner.innerHTML = "";
      }
    }

    document.getElementById("results-count").innerHTML = `共 <strong>${result.total}</strong> 款产品`;

    if (!result.items.length) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1;">
          <div class="icon">🔍</div>
          <p>没有找到符合条件的产品，试试调整筛选条件。</p>
        </div>`;
      renderPagination(result);
      return;
    }

    grid.innerHTML = result.items.map(renderProductCard).join("");
    UI.bindAddToCartButtons(grid);
    renderPagination(result);
  }

  function renderProductCard(product) {
    return `
      <a class="product-card" href="product.html?slug=${encodeURIComponent(product.slug)}">
        <div class="thumb">
          ${product.isFeatured ? `<span class="badge badge-featured">重点推荐</span>` : ""}
          <img src="${product.primaryImageUrl}" alt="${UI.escapeHtml(product.name)}" loading="lazy" />
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
    `;
  }

  function renderPagination(result) {
    const mount = document.getElementById("pagination");
    if (result.totalPages <= 1) {
      mount.innerHTML = "";
      return;
    }

    const buttons = [];
    buttons.push(`<button data-page="${result.page - 1}" ${result.page === 1 ? "disabled" : ""}>‹</button>`);
    for (let i = 1; i <= result.totalPages; i++) {
      buttons.push(`<button data-page="${i}" class="${i === result.page ? "is-active" : ""}">${i}</button>`);
    }
    buttons.push(`<button data-page="${result.page + 1}" ${result.page === result.totalPages ? "disabled" : ""}>›</button>`);

    mount.innerHTML = buttons.join("");
    mount.querySelectorAll("button[data-page]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        state.page = Number(btn.dataset.page);
        writeStateToUrl(state);
        await refreshResults(state);
        document.getElementById("product-grid").scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }
})();
