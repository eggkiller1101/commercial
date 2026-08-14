/**
 * contact-page.js —— 联系我们 / 通用项目咨询页 (contact.html)
 * ----------------------------------------------------------------------------
 * 跟产品详情页的单产品询价表单共用同一个 DataService.submitInquiry()，
 * 只是这里不带 productId（对应 policy.sql 里 inquiries.product_id 可为空的设计），
 * 用于承接"还没确定具体产品型号，只想先咨询方案"的通用咨询场景。
 */

(async function initContactPage() {
  await Promise.all([UI.renderHeader("contact"), UI.renderFooter()]);
  UI.renderDataSourceBanner();

  UI.renderBreadcrumb("breadcrumb-mount", [
    { label: "首页", href: "index.html" },
    { label: "联系我们", href: "#" }
  ]);

  document.getElementById("contact-hotline").textContent = window.APP_CONFIG.SERVICE_HOTLINE;
  document.getElementById("contact-email").textContent = window.APP_CONFIG.SERVICE_EMAIL;
  document.getElementById("contact-company-name").textContent = window.APP_CONFIG.SITE_NAME_FULL;

  const form = document.getElementById("contact-form");
  const feedback = document.getElementById("contact-form-feedback");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    feedback.className = "form-feedback";
    const submitBtn = document.getElementById("contact-submit-btn");
    submitBtn.disabled = true;
    submitBtn.textContent = "提交中...";

    const formData = new FormData(form);
    const scenarioLabels = {
      hospitality: "商旅交通建筑",
      energy: "能源核心场景",
      industrial: "通用工业与市政基建",
      overseas: "海外 EPC / 出海工程",
      other: "其他"
    };
    const scenario = formData.get("scenario");

    const payload = {
      name: formData.get("name"),
      company: formData.get("company"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      message: [
        scenario ? `【项目场景】${scenarioLabels[scenario] || scenario}` : null,
        formData.get("message") ? `【咨询内容】${formData.get("message")}` : null
      ]
        .filter(Boolean)
        .join("\n\n"),
      productId: null
    };

    const result = await DataService.submitInquiry(payload);

    submitBtn.disabled = false;
    submitBtn.textContent = "提交咨询";

    if (result.ok) {
      feedback.textContent = "提交成功，我们的工程师会尽快与您联系。";
      feedback.className = "form-feedback is-success";
      form.reset();
    } else {
      feedback.textContent = `提交失败：${result.message || "请稍后重试"}`;
      feedback.className = "form-feedback is-error";
    }
  });
})();
