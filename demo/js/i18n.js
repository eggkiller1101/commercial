/**
 * i18n.js —— 极简双语切换模块
 * ----------------------------------------------------------------------------
 * 设计取舍：产品数据（产品名称/描述等）来自 Supabase / mock-data.js，schema.sql
 * 里没有多语言字段（如 name_en），所以产品数据本身不翻译——这是数据库结构决定的
 * 已知限制，要支持产品级多语言，需要在 products/categories 表加 _en 字段或建
 * 一张 translations 表。目前这一层只覆盖"网站界面文案"：页头/页脚/导航/搜索框/
 * 购物车按钮 + 首页营销文案，用 `data-i18n` / `data-i18n-html` 标记翻译点。
 *
 * 切换方式：右上角语言按钮点击后把当前语言存进 localStorage，然后整页刷新——
 * 用刷新而不是原地重渲染，是因为部分内容由各页面自己的 JS（如产品列表、树状图）
 * 异步渲染，刷新能保证这些内容也用统一的语言重新走一遍渲染逻辑，不用给每个
 * 页面脚本都加一份"语言变化时重新渲染"的监听逻辑，实现更简单可靠。
 */

const I18N = (() => {
  const STORAGE_KEY = "cloudintel_site_lang";

  const dict = {
    zh: {
      "common.hotlinePrefix": "服务热线：",
      "nav.home": "首页",
      "nav.products": "产品中心",
      "nav.industries": "行业应用",
      "nav.services": "技术与服务",
      "nav.cases": "项目案例",
      "nav.resources": "资料中心",
      "nav.about": "关于我们",
      "nav.contact": "联系我们",
      "header.searchPlaceholder": "搜索产品名称 / 型号",
      "header.cartBtn": "上传清单询价",
      "footer.tagline": "唯特利 Victaulic® 官方授权合作代理商，专注高端消防管道系统与工业流体管道整体解决方案，服务国内及海外国际工程项目。",
      "footer.colProducts": "产品中心",
      "footer.linkPipeJoining": "管道连接解决方案",
      "footer.linkFireProtection": "消防解决方案",
      "footer.linkAllProducts": "全部产品",
      "footer.colSupport": "支持与服务",
      "footer.linkIndustries": "行业应用",
      "footer.linkServices": "技术与服务",
      "footer.linkResources": "资料中心",
      "footer.colAbout": "关于我们",
      "footer.linkCompanyProfile": "公司简介",
      "footer.linkCases": "项目案例",
      "footer.linkContact": "联系我们",
      "footer.colContact": "联系方式",
      "footer.hotlineLabel": "服务热线",
      "footer.channelEmailLabel": "邮箱咨询",
      "footer.channelWechatLabel": "微信咨询",
      "footer.channelWechatValue": "扫码添加工程师",
      "footer.responseNote": "实时响应",
      "footer.onlineInquiry": "在线询价 →",
      "footer.copyrightSuffix": "保留所有权利。",
      "products.treeSub": "点击任意节点直接进入该分类",

      "home.heroBadge": "唯特利 Victaulic® 官方授权合作代理商",
      "home.heroTitle": "品质全球化 · 服务全周期 · 工程零风险",
      "home.heroDesc": "专注高端消防管道系统与工业流体管道整体解决方案，立足北京、辐射全国、布局全球。为酒店、机场、大型公建、能源工业厂区及跨境工程项目，提供国际标准原厂设备、成套系统设计、跨境供货、海外现场技术落地与全周期运维一体化服务。",
      "home.ctaProducts": "主推产品",
      "home.ctaVideo": "观看公司介绍视频",
      "home.ctaContact": "联系我们",
      "home.aboutHeading": "公司介绍",
      "home.aboutSub": "云工智上（北京）科技有限公司",
      "home.aboutLede": "专注高端消防管道系统、工业流体管道整体解决方案的专业化技术服务型企业",
      "home.aboutP1": "云工智上（北京）科技有限公司是一家面向国内及海外国际工程项目、专注高端消防管道系统与工业流体管道整体解决方案的专业化技术服务型企业。公司深耕消防机电、工业建设、市政基建、海外总包、智慧建筑、能源工程、交通商旅配套等领域，为酒店、机场、大型公建、工业厂区及跨境工程项目提供国际标准原厂设备、成套系统设计、跨境供货、海外现场技术落地、全周期运维一体化服务。",
      "home.aboutP2": "公司为<strong>唯特利 Victaulic®</strong> 官方授权合作代理商，全权负责唯特利全系列沟槽管件、消防阀门、喷淋系统、管道预制系统等产品的销售、方案设计、项目配套及技术落地服务。依托百年品牌的全球技术标准、防爆耐腐蚀工业级产品体系与全系合规资质（CCCF、CCS、FM、UL、LPCB、VdS、欧盟 PED 等），可覆盖商用、工业、能源等多类高精高危复杂工况。",
      "home.tag1": "消防机电",
      "home.tag2": "工业建设",
      "home.tag3": "市政基建",
      "home.tag4": "海外总包",
      "home.tag5": "智慧建筑",
      "home.tag6": "能源工程",
      "home.tag7": "交通商旅配套",
      "home.aboutSideHeading": "核心生产与研发支撑（唯特利大连基地）",
      "home.aboutSideLi1": "<strong>成立时间</strong>2005 年成立，2010 年追加投资扩产",
      "home.aboutSideLi2": "<strong>厂区规模</strong>占地 37,000 ㎡，员工 400 余人",
      "home.aboutSideLi3": "<strong>核心产品</strong>沟槽卡箍、消防管件、喷淋头、喷淋软管",
      "home.aboutSideLi4": "<strong>研发中心</strong>美国之外首家海外亚太研发中心（ARDC）",
      "home.aboutSideLi5": "<strong>供应网络</strong>亚洲消防管道产品核心供应枢纽，产品远销全球",
      "home.videoHeading": "公司介绍视频",
      "home.videoSub": "了解云工智上与唯特利的全球合作体系",
      "home.productsHeading": "主推产品",
      "home.productsSub": "唯特利授权全系列沟槽卡箍、管件、阀门与喷淋系统产品",
      "home.viewAll": "进入产品中心 →",
      "home.contactHeading": "需要产品选型或技术支持？",
      "home.contactDesc": "进入任意产品详情页即可加入询价清单，或直接前往联系我们页面提交项目咨询；工程师会在 1 个工作日内与您联系，国际项目支持全英文对接。",
      "home.browseProducts": "浏览产品中心"
    },
    en: {
      "common.hotlinePrefix": "Hotline: ",
      "nav.home": "Home",
      "nav.products": "Products",
      "nav.industries": "Industries",
      "nav.services": "Services",
      "nav.cases": "Case Studies",
      "nav.resources": "Resources",
      "nav.about": "About Us",
      "nav.contact": "Contact Us",
      "header.searchPlaceholder": "Search product name / model",
      "header.cartBtn": "Quote List",
      "footer.tagline": "Authorized Victaulic® reseller focused on high-end fire protection pipe systems and industrial fluid piping solutions, serving projects in China and overseas.",
      "footer.colProducts": "Products",
      "footer.linkPipeJoining": "Pipe Joining Solutions",
      "footer.linkFireProtection": "Fire Protection Solutions",
      "footer.linkAllProducts": "All Products",
      "footer.colSupport": "Support & Services",
      "footer.linkIndustries": "Industries",
      "footer.linkServices": "Services",
      "footer.linkResources": "Resources",
      "footer.colAbout": "About Us",
      "footer.linkCompanyProfile": "Company Profile",
      "footer.linkCases": "Case Studies",
      "footer.linkContact": "Contact Us",
      "footer.colContact": "Contact",
      "footer.hotlineLabel": "Service Hotline",
      "footer.channelEmailLabel": "Email",
      "footer.channelWechatLabel": "WeChat",
      "footer.channelWechatValue": "Scan to add our engineer",
      "footer.responseNote": "Real-time response",
      "footer.onlineInquiry": "Get a Quote →",
      "footer.copyrightSuffix": "All rights reserved.",
      "products.treeSub": "Click any node to jump straight into that category",

      "home.heroBadge": "Authorized Victaulic® Reseller",
      "home.heroTitle": "Global Quality · Full Lifecycle Service · Zero Project Risk",
      "home.heroDesc": "Focused on high-end fire protection pipe systems and integrated industrial fluid piping solutions, based in Beijing and serving projects nationwide and worldwide. For hotels, airports, major public buildings, energy and industrial sites, and cross-border projects, we provide internationally certified factory equipment, complete system design, cross-border supply, on-site technical support overseas, and full-lifecycle maintenance.",
      "home.ctaProducts": "Featured Products",
      "home.ctaVideo": "Watch Company Video",
      "home.ctaContact": "Contact Us",
      "home.aboutHeading": "About Us",
      "home.aboutSub": "CloudIntel Works (Beijing) Technology Co., Ltd.",
      "home.aboutLede": "A specialized technical service company focused on high-end fire protection pipe systems and integrated industrial fluid piping solutions",
      "home.aboutP1": "CloudIntel Works (Beijing) Technology Co., Ltd. is a specialized technical service company serving domestic and overseas engineering projects, focused on high-end fire protection pipe systems and integrated industrial fluid piping solutions. The company operates across fire protection & electromechanical, industrial construction, municipal infrastructure, overseas EPC contracting, smart buildings, energy engineering, and transportation/hospitality sectors — providing internationally certified factory equipment, complete system design, cross-border supply, on-site technical delivery overseas, and full-lifecycle maintenance services for hotels, airports, major public buildings, industrial sites, and cross-border projects.",
      "home.aboutP2": "The company is an authorized reseller of <strong>Victaulic®</strong>, fully responsible for the sales, solution design, project support, and technical delivery of Victaulic's full range of grooved fittings, fire protection valves, sprinkler systems, and pre-fabricated piping systems. Backed by a century-old brand's global technical standards and a corrosion/explosion-resistant industrial-grade product line with full compliance certifications (CCCF, CCS, FM, UL, LPCB, VdS, EU PED, etc.), it covers demanding commercial, industrial, and energy applications.",
      "home.tag1": "Fire Protection & Electromechanical",
      "home.tag2": "Industrial Construction",
      "home.tag3": "Municipal Infrastructure",
      "home.tag4": "Overseas EPC",
      "home.tag5": "Smart Buildings",
      "home.tag6": "Energy Engineering",
      "home.tag7": "Transportation & Hospitality",
      "home.aboutSideHeading": "Core Manufacturing & R&D Base (Victaulic Dalian)",
      "home.aboutSideLi1": "<strong>Founded</strong>Established 2005, expanded with further investment in 2010",
      "home.aboutSideLi2": "<strong>Site Scale</strong>37,000 ㎡, 400+ employees",
      "home.aboutSideLi3": "<strong>Core Products</strong>Grooved couplings, fire protection fittings, sprinkler heads, sprinkler hoses",
      "home.aboutSideLi4": "<strong>R&D Center</strong>First overseas Asia-Pacific R&D Center (ARDC) outside the US",
      "home.aboutSideLi5": "<strong>Supply Network</strong>Core supply hub for fire protection pipe products in Asia, distributed worldwide",
      "home.videoHeading": "Company Video",
      "home.videoSub": "Learn about CloudIntel Works' global partnership with Victaulic",
      "home.productsHeading": "Featured Products",
      "home.productsSub": "Victaulic's full authorized range of grooved couplings, fittings, valves, and sprinkler systems",
      "home.viewAll": "Browse Products →",
      "home.contactHeading": "Need product selection or technical support?",
      "home.contactDesc": "Add items to your quote list from any product page, or go straight to Contact Us to submit a project inquiry — our engineers respond within 1 business day, with full English support for international projects.",
      "home.browseProducts": "Browse Products"
    }
  };

  function getLang() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "en" ? "en" : "zh";
  }

  function setLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    window.location.reload();
  }

  function t(key) {
    const lang = getLang();
    return (dict[lang] && dict[lang][key]) || dict.zh[key] || key;
  }

  /** 扫描 root 范围内所有 [data-i18n] / [data-i18n-html] / [data-i18n-placeholder] 节点并替换文案 */
  function applyI18n(root = document) {
    root.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    root.querySelectorAll("[data-i18n-html]").forEach((el) => {
      el.innerHTML = t(el.getAttribute("data-i18n-html"));
    });
    root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
    });
    document.documentElement.lang = getLang() === "en" ? "en" : "zh-CN";
  }

  return { getLang, setLang, t, applyI18n };
})();
