/**
 * cases-page.js —— 项目案例页 (cases.html)
 * ----------------------------------------------------------------------------
 * 案例数据目前是原型阶段的"代表性场景说明"（不是真实项目名称/业主信息），
 * 先内嵌在这个文件里；等有真实、可公开的项目案例后，可以参照 mock-data.js
 * 的模式改成从 Supabase 的 project_cases 表读取（当前 schema.sql 未包含
 * 该表，属于本原型的已知简化点，已记录在 README 里）。
 */

const MOCK_CASES = [
  {
    tag: "hospitality",
    tagLabel: "商旅交通建筑",
    title: "华东某国际机场航站楼消防系统改造",
    desc: "为航站楼候机区、行李分拣区提供沟槽式消防管路系统整体解决方案，配合原有建筑结构完成非焊接快速施工。",
    icon: "✈️"
  },
  {
    tag: "hospitality",
    tagLabel: "商旅交通建筑",
    title: "华南高端酒店集群消防喷淋系统供货",
    desc: "为多栋高端酒店客房与公共区域提供直立型 / 边墙型喷淋头及配套阀组，满足轻中危险级场所消防设计规范。",
    icon: "🏨"
  },
  {
    tag: "energy",
    tagLabel: "能源核心场景",
    title: "西北 LNG 接收站管路连接系统",
    desc: "为 LNG 接收站长输管线提供高压力等级沟槽式管件与法兰接头，满足低温、耐腐蚀工况的技术要求。",
    icon: "⚡"
  },
  {
    tag: "energy",
    tagLabel: "能源核心场景",
    title: "华北炼化一体化项目管路配套",
    desc: "为炼化园区厂区管路提供成套沟槽连接产品与法兰过渡件，配合项目属地认证要求完成材质与压力等级选型。",
    icon: "🛢️"
  },
  {
    tag: "industrial",
    tagLabel: "通用工业与市政基建",
    title: "华中市政给排水管网升级工程",
    desc: "针对大直径埋地给排水管路，提供标准化沟槽卡箍与异径接头，实现批量化快速施工，缩短工期。",
    icon: "🏗️"
  },
  {
    tag: "industrial",
    tagLabel: "通用工业与市政基建",
    title: "沿海污水处理厂扩建项目",
    desc: "为污水处理厂扩建部分提供耐腐蚀材质的管路连接产品，配合泵房法兰式设备完成系统对接。",
    icon: "💧"
  },
  {
    tag: "overseas",
    tagLabel: "海外 EPC",
    title: "东南亚工业园区消防系统总包配套",
    desc: "为中国企业出海总包项目提供全英文技术资料与海外驻场技术指导，完成消防系统成套设备供货。",
    icon: "🌏"
  },
  {
    tag: "overseas",
    tagLabel: "海外 EPC",
    title: "中东石化项目管路系统技术支持",
    desc: "为出海总包项目提供国际标准合规资料包与远程技术支持，配合当地施工规范完成产品选型。",
    icon: "🌐"
  }
];

(async function initCasesPage() {
  await Promise.all([UI.renderHeader("cases"), UI.renderFooter()]);
  UI.renderDataSourceBanner();

  UI.renderBreadcrumb("breadcrumb-mount", [
    { label: "首页", href: "index.html" },
    { label: "项目案例", href: "#" }
  ]);

  let activeTag = "all";
  renderCases();

  document.getElementById("case-filter-bar").querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeTag = btn.dataset.tag;
      document.querySelectorAll("#case-filter-bar button").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      renderCases();
    });
  });

  function renderCases() {
    const mount = document.getElementById("case-grid");
    const list = activeTag === "all" ? MOCK_CASES : MOCK_CASES.filter((c) => c.tag === activeTag);
    mount.innerHTML = list
      .map(
        (item) => `
      <div class="case-card">
        <div class="case-thumb">${item.icon}</div>
        <div class="case-body">
          <span class="case-tag">${UI.escapeHtml(item.tagLabel)}</span>
          <h3>${UI.escapeHtml(item.title)}</h3>
          <p>${UI.escapeHtml(item.desc)}</p>
        </div>
      </div>
    `
      )
      .join("");
  }
})();
