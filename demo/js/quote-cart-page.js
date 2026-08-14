/**
 * quote-cart-page.js —— 询价清单页 (quote-cart.html)
 * ----------------------------------------------------------------------------
 * 列表数量增减 / 删除都直接操作 QuoteCart（localStorage），页面只负责重渲染；
 * 提交表单调用 QuoteCart.submit()，内部会把清单拼进 DataService.submitInquiry()
 * 的 message 字段（详见 quote-cart.js 顶部注释里对这个折中方案的说明）。
 */

(async function initQuoteCartPage() {
  await Promise.all([UI.renderHeader(""), UI.renderFooter()]);
  UI.renderDataSourceBanner();

  UI.renderBreadcrumb("breadcrumb-mount", [
    { label: "首页", href: "index.html" },
    { label: "询价清单", href: "#" }
  ]);

  renderList();
  QuoteCart.onChange(renderList);

  bindForm();

  function renderList() {
    const mount = document.getElementById("cart-list-mount");
    const items = QuoteCart.getItems();

    if (!items.length) {
      mount.innerHTML = `
        <div class="cart-empty-state">
          <div class="icon" style="font-size:36px;margin-bottom:10px;">🗂️</div>
          <p>询价清单还是空的，去<a href="products.html" style="color:var(--primary-600);font-weight:600;">产品中心</a>挑选需要的产品吧。</p>
        </div>
      `;
      document.getElementById("cart-submit-btn").disabled = false; // 允许无产品仅提交项目咨询
      return;
    }

    mount.innerHTML = items
      .map(
        (item) => `
      <div class="cart-line-item" data-product-id="${UI.escapeHtml(item.productId)}">
        <div class="thumb"><img src="${item.imageUrl}" alt="${UI.escapeHtml(item.name)}" /></div>
        <div class="info">
          <span class="model-number">${UI.escapeHtml(item.modelNumber || "")}</span>
          <h4>${UI.escapeHtml(item.name)}</h4>
          <span class="cat">${UI.escapeHtml(item.categoryName || "")}</span>
        </div>
        <div class="qty-stepper" data-product-id="${UI.escapeHtml(item.productId)}">
          <button type="button" data-step="-1" aria-label="减少数量">−</button>
          <input type="number" class="qty-input" value="${item.quantity}" min="1" />
          <button type="button" data-step="1" aria-label="增加数量">+</button>
        </div>
        <button type="button" class="cart-remove-btn" data-remove="${UI.escapeHtml(item.productId)}">移除</button>
      </div>
    `
      )
      .join("") +
      `<div class="cart-summary-bar">
        <span>共 <strong>${items.length}</strong> 款产品，合计数量 <strong>${QuoteCart.count()}</strong></span>
        <button type="button" class="btn btn-ghost btn-sm" id="cart-clear-btn">清空清单</button>
      </div>`;

    mount.querySelectorAll(".qty-stepper").forEach((stepper) => {
      const productId = stepper.dataset.productId;
      const input = stepper.querySelector(".qty-input");
      stepper.querySelectorAll("button[data-step]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const next = Math.max(1, (Number(input.value) || 1) + Number(btn.dataset.step));
          QuoteCart.updateQuantity(productId, next);
        });
      });
      input.addEventListener("change", () => {
        QuoteCart.updateQuantity(productId, Number(input.value) || 1);
      });
    });

    mount.querySelectorAll("[data-remove]").forEach((btn) => {
      btn.addEventListener("click", () => {
        QuoteCart.removeItem(btn.dataset.remove);
        UI.toast("已从清单移除");
      });
    });

    const clearBtn = document.getElementById("cart-clear-btn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        QuoteCart.clear();
        UI.toast("已清空询价清单");
      });
    }
  }

  function bindForm() {
    const form = document.getElementById("cart-submit-form");
    const feedback = document.getElementById("cart-form-feedback");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      feedback.className = "form-feedback";
      const submitBtn = document.getElementById("cart-submit-btn");
      submitBtn.disabled = true;
      submitBtn.textContent = "提交中...";

      const formData = new FormData(form);
      const contactInfo = {
        projectName: formData.get("projectName"),
        name: formData.get("name"),
        company: formData.get("company"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        message: formData.get("message"),
        attachmentNote: document.getElementById("attachment-input").files.length
          ? `用户选择了 ${document.getElementById("attachment-input").files.length} 个附件（原型演示未实际上传）`
          : ""
      };

      const result = await QuoteCart.submit(contactInfo);

      submitBtn.disabled = false;
      submitBtn.textContent = "提交询价清单";

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
