// ----------------------------------------------------------------------------
// 极简双语字典，移植自 demo 静态站 prototype/js/i18n.js 的思路和大部分文案：
// 只覆盖"网站界面文案"(导航/页头/页脚/首页营销文案/关于我们等静态内容)，
// 不覆盖产品/分类等来自 Supabase 的数据本身——schema.sql 里没有 _en 字段，
// 这是数据库结构决定的已知限制(跟 demo 站文档里写的一致)，要支持产品级多语言
// 需要在 products/categories 表加 _en 字段或建一张 translations 表。
// ----------------------------------------------------------------------------

export type Locale = "zh" | "en";

export const LOCALE_COOKIE = "site_lang";
export const DEFAULT_LOCALE: Locale = "zh";

const dict = {
  zh: {
    "common.hotlinePrefix": "服务热线 ",
    "nav.home": "首页",
    "nav.products": "产品中心",
    "nav.documents": "资料下载",
    "nav.about": "关于我们",
    "nav.contact": "联系我们",
    "header.searchPlaceholder": "搜索产品名称 / 型号",
    "header.cartBtn": "询价清单",
    "footer.tagline":
      "Victaulic® 授权经销商，提供图纸国际化、产品全球化、施工标准化、服务本地化的一站式管道连接与消防解决方案。",
    "footer.colProducts": "产品与服务",
    "footer.linkAllProducts": "产品中心",
    "footer.linkDocuments": "资料下载",
    "footer.linkQuoteCart": "询价清单",
    "footer.colContact": "联系方式",
    "footer.hotlineLabel": "服务热线",
    "footer.channelEmailLabel": "邮箱咨询",
    "footer.channelWechatLabel": "微信咨询",
    "footer.channelWechatValue": "扫码添加工程师",
    "footer.onlineInquiry": "在线询价 →",
    "footer.copyrightSuffix": "保留所有权利。",

    "home.heroBadge": "Victaulic® 授权经销商",
    "home.heroTitle1": "图纸国际化 · 产品全球化",
    "home.heroTitle2": "施工标准化 · 服务本地化",
    "home.heroDesc":
      "云工智上（北京）科技有限公司提供管道连接与消防解决方案的一站式技术服务与全球产品供货，展示已上架产品、技术资料，并为客户提供在线询价入口。",
    "home.browseProducts": "浏览产品中心",
    "home.ctaContact": "联系我们",
    "home.featuredHeading": "推荐产品",
    "home.featuredSub": "只展示 CMS 中状态为已上架的产品",
    "home.viewAll": "全部产品 →",
    "home.contactHeading": "需要产品选型或技术支持？",
    "home.contactDesc":
      "进入任意产品详情页即可加入询价清单，或直接前往联系我们页面提交项目咨询；工程师会在 1 个工作日内与您联系。",

    "products.heroEyebrow": "产品中心",
    "products.heroTitle": "产品目录",
    "products.heroDesc": "全部已上架产品，支持加入询价清单批量提交询价。",
    "products.resultCount": "共 {count} 款产品",
    "products.searchKeyword": "关键字",
    "products.filterCategory": "产品分类",
    "products.filterAll": "全部分类",
    "products.noResults": "没有匹配的产品，换个关键字或分类试试",
    "products.prevPage": "上一页",
    "products.nextPage": "下一页",
    "products.noPublished": "暂无已上架产品",
    "products.noSummary": "暂无产品简介",
    "products.viewDetail": "查看详情",
    "products.addToCart": "加入询价清单",
    "products.added": "已加入 ✓",

    "about.eyebrow": "关于我们",
    "about.partnerBadge": "唯特利 Victaulic® 官方授权合作代理商",
    "about.title": "云工智上（北京）科技有限公司",
    "about.subtitle": "专注高端消防管道系统、工业流体管道整体解决方案的专业化技术服务型企业",
    "about.p1":
      "云工智上（北京）科技有限公司是一家面向国内及海外国际工程项目、专注高端消防管道系统与工业流体管道整体解决方案的专业化技术服务型企业。公司深耕消防机电、工业建设、市政基建、海外总包、智慧建筑、能源工程、交通商旅配套等领域，为酒店、机场、大型公建、工业厂区及跨境工程项目提供国际标准原厂设备、成套系统设计、跨境供货、海外现场技术落地、全周期运维一体化服务。",
    "about.p2":
      "公司为唯特利 Victaulic® 官方授权合作代理商，全权负责唯特利全系列沟槽管件、消防阀门、喷淋系统、管道预制系统等产品的销售、方案设计、项目配套及技术落地服务。依托百年品牌的全球技术标准、防爆耐腐蚀工业级产品体系与全系合规资质，可覆盖商用、工业、能源等多类高精高危复杂工况。",
    "about.p3":
      "公司具备成熟的能源、商旅交通项目落地经验与完善外贸供应链，是国内为数不多可同步承接国内酒店、机场、油气储运、石油化工工程，以及中国企业出海同类总包项目的唯特利专业服务商。",
    "about.tag1": "消防机电",
    "about.tag2": "工业建设",
    "about.tag3": "市政基建",
    "about.tag4": "海外总包",
    "about.tag5": "智慧建筑",
    "about.tag6": "能源工程",
    "about.tag7": "交通商旅配套",
    "about.sideHeading": "核心生产与研发支撑（唯特利大连基地）",
    "about.sideLi1Label": "成立时间",
    "about.sideLi1Value": "2005 年成立，2010 年追加投资扩产",
    "about.sideLi2Label": "厂区规模",
    "about.sideLi2Value": "占地 37,000 ㎡，员工 400 余人",
    "about.sideLi3Label": "核心产品",
    "about.sideLi3Value": "沟槽卡箍、消防管件、喷淋头、喷淋软管",
    "about.sideLi4Label": "研发中心",
    "about.sideLi4Value": "美国之外首家海外亚太研发中心（ARDC）",
    "about.sideLi5Label": "供应网络",
    "about.sideLi5Value": "亚洲消防管道产品核心供应枢纽，产品远销全球",
    "about.timelineHeading": "发展历程",
    "about.timelineSub": "唯特利百年品牌积淀，云工智上本地化专业服务",
    "about.timeline1925": "唯特利 Victaulic® 品牌创立，开创沟槽式机械管道连接技术。",
    "about.timeline2005": "唯特利大连生产研发基地成立，成为美国之外首家海外亚太研发中心（ARDC）所在地。",
    "about.timeline2010": "大连基地追加投资扩产，占地扩展至 37,000 ㎡，员工规模超 400 人，成为亚洲消防管道产品核心供应枢纽。",
    "about.timelineNow": "云工智上（北京）科技有限公司成为唯特利官方授权合作代理商，为国内及出海工程项目提供全周期技术服务。",
    "about.certHeading": "合规资质",
    "about.certSub": "唯特利产品体系覆盖的国际主流认证",
    "about.certNote": "具体产品适用认证以官方证书为准，如需某型号的完整认证清单，请联系工程师索取。",
    "about.ctaTitle": "想进一步了解公司资质或产品体系？",
    "about.ctaDesc": "工程师可为您提供完整的公司介绍资料与产品认证清单。",
    "about.ctaBtn": "联系我们"
  },
  en: {
    "common.hotlinePrefix": "Hotline ",
    "nav.home": "Home",
    "nav.products": "Products",
    "nav.documents": "Resources",
    "nav.about": "About Us",
    "nav.contact": "Contact Us",
    "header.searchPlaceholder": "Search product name / model",
    "header.cartBtn": "Quote List",
    "footer.tagline":
      "Authorized Victaulic® reseller providing globalized products, standardized installation, and localized service for pipe joining and fire protection solutions.",
    "footer.colProducts": "Products & Services",
    "footer.linkAllProducts": "Products",
    "footer.linkDocuments": "Resources",
    "footer.linkQuoteCart": "Quote List",
    "footer.colContact": "Contact",
    "footer.hotlineLabel": "Service Hotline",
    "footer.channelEmailLabel": "Email",
    "footer.channelWechatLabel": "WeChat",
    "footer.channelWechatValue": "Scan to add our engineer",
    "footer.onlineInquiry": "Get a Quote →",
    "footer.copyrightSuffix": "All rights reserved.",

    "home.heroBadge": "Authorized Victaulic® Reseller",
    "home.heroTitle1": "Global Products, Local Service",
    "home.heroTitle2": "Standardized Installation, Worldwide Reach",
    "home.heroDesc":
      "CloudIntel Works (Beijing) Technology Co., Ltd. provides one-stop technical services and global product supply for pipe joining and fire protection solutions, with published products, technical documents, and an online quote request entry point.",
    "home.browseProducts": "Browse Products",
    "home.ctaContact": "Contact Us",
    "home.featuredHeading": "Featured Products",
    "home.featuredSub": "Only products with status \"published\" in the CMS are shown",
    "home.viewAll": "All Products →",
    "home.contactHeading": "Need product selection or technical support?",
    "home.contactDesc":
      "Add items to your quote list from any product page, or go straight to Contact Us to submit a project inquiry — our engineers respond within 1 business day.",

    "products.heroEyebrow": "Products",
    "products.heroTitle": "Product Catalog",
    "products.heroDesc": "All published products. Add items to your quote list to submit a batch inquiry.",
    "products.resultCount": "{count} products",
    "products.searchKeyword": "Keyword",
    "products.filterCategory": "Category",
    "products.filterAll": "All Categories",
    "products.noResults": "No matching products — try a different keyword or category",
    "products.prevPage": "Previous",
    "products.nextPage": "Next",
    "products.noPublished": "No published products yet",
    "products.noSummary": "No product summary available",
    "products.viewDetail": "View Details",
    "products.addToCart": "Add to Quote List",
    "products.added": "Added ✓",

    "about.eyebrow": "About Us",
    "about.partnerBadge": "Authorized Victaulic® Reseller",
    "about.title": "CloudIntel Works (Beijing) Technology Co., Ltd.",
    "about.subtitle":
      "A specialized technical service company focused on high-end fire protection pipe systems and integrated industrial fluid piping solutions",
    "about.p1":
      "CloudIntel Works (Beijing) Technology Co., Ltd. is a specialized technical service company serving domestic and overseas engineering projects, focused on high-end fire protection pipe systems and integrated industrial fluid piping solutions. The company operates across fire protection & electromechanical, industrial construction, municipal infrastructure, overseas EPC contracting, smart buildings, energy engineering, and transportation/hospitality sectors.",
    "about.p2":
      "The company is an authorized reseller of Victaulic®, fully responsible for the sales, solution design, project support, and technical delivery of Victaulic's full range of grooved fittings, fire protection valves, sprinkler systems, and pre-fabricated piping systems.",
    "about.p3":
      "The company has mature experience delivering energy and transportation/hospitality projects with a well-established international supply chain, and is one of the few Victaulic service providers in China able to support domestic hotel, airport, oil & gas, and petrochemical projects alongside overseas EPC projects for Chinese contractors.",
    "about.tag1": "Fire Protection & Electromechanical",
    "about.tag2": "Industrial Construction",
    "about.tag3": "Municipal Infrastructure",
    "about.tag4": "Overseas EPC",
    "about.tag5": "Smart Buildings",
    "about.tag6": "Energy Engineering",
    "about.tag7": "Transportation & Hospitality",
    "about.sideHeading": "Core Manufacturing & R&D Base (Victaulic Dalian)",
    "about.sideLi1Label": "Founded",
    "about.sideLi1Value": "Established 2005, expanded with further investment in 2010",
    "about.sideLi2Label": "Site Scale",
    "about.sideLi2Value": "37,000 ㎡, 400+ employees",
    "about.sideLi3Label": "Core Products",
    "about.sideLi3Value": "Grooved couplings, fire protection fittings, sprinkler heads, sprinkler hoses",
    "about.sideLi4Label": "R&D Center",
    "about.sideLi4Value": "First overseas Asia-Pacific R&D Center (ARDC) outside the US",
    "about.sideLi5Label": "Supply Network",
    "about.sideLi5Value": "Core supply hub for fire protection pipe products in Asia, distributed worldwide",
    "about.timelineHeading": "Our History",
    "about.timelineSub": "A century of Victaulic heritage, delivered locally by CloudIntel Works",
    "about.timeline1925": "Victaulic® founded, pioneering grooved mechanical pipe joining technology.",
    "about.timeline2005": "Victaulic's Dalian manufacturing and R&D base established, becoming the first overseas Asia-Pacific R&D Center (ARDC) outside the US.",
    "about.timeline2010": "The Dalian base expanded to 37,000 ㎡ with 400+ employees, becoming Asia's core supply hub for fire protection pipe products.",
    "about.timelineNow": "CloudIntel Works (Beijing) Technology Co., Ltd. becomes an authorized Victaulic reseller, providing full-lifecycle technical services for domestic and overseas projects.",
    "about.certHeading": "Certifications",
    "about.certSub": "Major international certifications covered by the Victaulic product line",
    "about.certNote": "Applicable certifications vary by product — contact our engineers for the full certification list for a specific model.",
    "about.ctaTitle": "Want to learn more about our qualifications or product line?",
    "about.ctaDesc": "Our engineers can provide a full company profile and certification list.",
    "about.ctaBtn": "Contact Us"
  }
} as const;

export type DictionaryKey = keyof (typeof dict)["zh"];

export function t(locale: Locale, key: DictionaryKey, vars?: Record<string, string | number>): string {
  const raw = dict[locale]?.[key] ?? dict[DEFAULT_LOCALE][key] ?? key;

  if (!vars) {
    return raw;
  }

  return Object.entries(vars).reduce(
    (acc, [varName, value]) => acc.replaceAll(`{${varName}}`, String(value)),
    raw as string
  );
}
