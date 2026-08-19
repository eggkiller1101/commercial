export const locales = ["zh", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "zh";
export const localeCookieName = "site_locale";

export function normalizeLocale(value?: string | null): Locale {
  return value === "en" ? "en" : defaultLocale;
}

export const dictionaries = {
  zh: {
    common: {
      addToQuote: "+ 加入清单",
      all: "全部",
      backHome: "返回首页",
      contactUs: "联系我们",
      dataSource: "实时数据",
      dataSourceText: "当前页面数据来自真实 Supabase 项目",
      download: "下载",
      featured: "重点推荐",
      home: "首页",
      noFile: "暂无文件",
      noImage: "暂无图片",
      notFoundDescription: "请返回首页继续浏览。",
      notFoundTitle: "页面不存在",
      viewAll: "查看全部 →",
      viewDetails: "查看详情"
    },
    nav: {
      about: "关于我们",
      cases: "项目案例",
      contact: "联系我们",
      home: "首页",
      industries: "行业应用",
      products: "产品中心",
      quote: "上传清单询价",
      resources: "资料中心",
      searchPlaceholder: "搜索产品名称 / 型号",
      services: "技术与服务",
      serviceHotline: "服务热线：400-000-0000",
      switchLanguage: "English",
      viewAll: "查看全部 →"
    },
    footer: {
      about: "关于我们",
      allProducts: "全部产品",
      companyIntro: "公司介绍",
      contact: "联系方式",
      description:
        "专注高端消防管道系统与工业流体管道整体解决方案，提供产品选型、成套供货、技术支持与全周期服务。",
      email: "邮箱咨询",
      response: "工程师会在 1 个工作日内与您联系。",
      serviceHotline: "服务热线",
      techSupport: "技术支持"
    },
    home: {
      aboutBody1:
        "云工智上（北京）科技有限公司是一家面向国内及海外国际工程项目、专注高端消防管道系统与工业流体管道整体解决方案的专业化技术服务型企业。公司深耕消防机电、工业建设、市政基建、海外总包、智慧建筑、能源工程、交通商旅配套等领域。",
      aboutBody2:
        "官方授权合作代理商，全权负责唯特利全系列沟槽管件、消防阀门、喷淋系统、管道预制系统等产品的销售、方案设计、项目配套及技术落地服务。",
      aboutLede:
        "专注高端消防管道系统、工业流体管道整体解决方案的专业化技术服务型企业",
      aboutSubtitle: "云工智上（北京）科技有限公司",
      aboutTitle: "公司介绍",
      browseProducts: "浏览产品中心",
      coreBase: "核心生产与研发支撑（唯特利大连基地）",
      coreItems: [
        ["成立时间", "2005 年成立，2010 年追加投资扩产"],
        ["厂区规模", "占地 37,000 ㎡，员工 400 余人"],
        ["核心产品", "沟槽卡箍、消防管件、喷淋头、喷淋软管"],
        ["研发中心", "美国之外首家海外亚太研发中心（ARDC）"],
        ["供应网络", "亚洲消防管道产品核心供应枢纽，产品远销全球"]
      ],
      ctaBody:
        "进入任意产品详情页即可加入询价清单，或直接前往联系我们页面提交项目咨询；工程师会在 1 个工作日内与您联系，国际项目支持全英文对接。",
      ctaTitle: "需要产品选型或技术支持？",
      heroBadge: "唯特利 Victaulic® 官方授权合作代理商",
      heroBody:
        "专注高端消防管道系统与工业流体管道整体解决方案，立足北京、辐射全国、布局全球。为酒店、机场、大型公建、能源工业厂区及跨境工程项目，提供国际标准原厂设备、成套系统设计、跨境供货、海外现场技术落地与全周期运维一体化服务。",
      heroTitle: "品质全球化 · 服务全周期 · 工程零风险",
      featuredProducts: "主推产品",
      featuredProductsDesc: "唯特利授权全系列沟槽卡箍、管件、阀门与喷淋系统产品",
      introVideo: "公司介绍视频",
      introVideoDesc: "了解云工智上与唯特利的全球合作体系",
      productAnchor: "主推产品",
      videoUnsupported: "您的浏览器暂不支持视频播放。",
      watchVideo: "观看公司介绍视频"
    },
    products: {
      activeCategory: "分类：",
      allProducts: "全部产品",
      breadcrumb: "产品中心",
      categoryOverview: "产品分类总览",
      categoryOverviewDesc: "点击任意节点直接进入该分类",
      categoryTitle: "产品分类",
      childCategory: "子类",
      clearFilters: "清除全部筛选",
      empty: "没有找到符合条件的产品，试试调整筛选条件。",
      filterByAttributes: "按技术参数筛选",
      keyword: "关键词：",
      keywordResultPrefix: "为你找到",
      keywordResultSuffix: "条相关产品",
      max: "最大",
      min: "最小",
      model: "型号 / Style：",
      noDescription: "暂无详细描述。",
      noDocuments: "暂无可下载的技术文档。",
      noSpecs: "暂无技术参数。",
      noVariants: "暂无规格型号数据。",
      noLimit: "不限",
      overview: "大类",
      publishedNewest: "最新发布",
      related: "相关产品",
      resultCountPrefix: "共",
      resultCountSuffix: "款产品",
      searchPlaceholder: "搜索产品名称 / 型号",
      sortModel: "型号 A-Z",
      sortName: "名称 A-Z",
      tabs: {
        description: "产品描述",
        documents: "相关文档",
        specs: "技术参数",
        variants: "规格型号"
      },
      applicationNotes: "适用场景/安装注意：",
      quoteNow: "直接提交询价",
      downloadDocuments: "下载技术资料",
      inquiryTitle: "立即询价",
      inquiryDescPrefix: "咨询产品",
      inquiryDescSuffix: "工程师将在 1 个工作日内与您联系",
      decreaseQty: "减少数量",
      increaseQty: "增加数量",
      variantName: "规格名称"
    },
    category: {
      browseAllPrefix: "浏览全部产品（",
      browseAllSuffix: "）",
      getAdvice: "获取选型建议",
      subcategories: "子分类",
      subcategoriesDesc: "选择下面的子分类，快速定位到具体产品系列",
      subcategoryDesc: "查看该系列下的产品与技术资料。",
      viewProducts: "查看产品 →",
      featuredDesc: "该分类下的重点产品",
      ctaTitle: "需要该分类的选型建议？",
      ctaDesc: "工程师可根据项目场景推荐合适产品。"
    },
    inquiryForm: {
      clientFileTooLarge: "上传文件不能超过 20MB，请压缩后重新上传",
      company: "公司名称",
      companyPlaceholder: "请输入公司名称",
      email: "邮箱",
      emailPlaceholder: "用于接收报价邮件",
      fileHint: "支持上传 csv、pdf、dwg、dxf、jpg、png 文件，最大 20MB。",
      fileLabel: "上传图纸 / 询价单",
      message: "询价内容",
      messagePlaceholder: "请描述管径、数量、项目场景等信息，方便我们更准确报价",
      name: "姓名",
      namePlaceholder: "请输入您的姓名",
      phone: "联系电话",
      phonePlaceholder: "请输入手机号 / 座机号",
      submitting: "提交中，请稍候",
      submitInquiry: "提交询价"
    },
    quoteCart: {
      cartEmpty: "询价清单为空，可以从产品详情页加入产品，也可以直接填写右侧表单。",
      contactQuestion: "没有具体产品，只想咨询项目方案？",
      contactText: "前往联系我们页面 →",
      delete: "删除",
      fileDesc: "请在右侧表单中上传 BOQ 清单、CAD 图纸或 PDF 技术文件，提交后销售工程师会一并收到。",
      fileTitle: "上传图纸 / 询价单",
      formTitle: "项目与联系人信息",
      inquiryList: "询价清单：",
      pageDesc: "确认清单内容，补充项目信息后一键提交，工程师将在 1 个工作日内与您联系",
      pageTitle: "询价清单",
      productId: "产品 ID：",
      submitLabel: "提交询价清单",
      processDesc: "从提交询价到拿到正式报价，一共 4 步",
      processTitle: "提交后如何处理",
      steps: [
        ["1", "提交询价", "确认清单与项目信息后一键提交"],
        ["2", "工程师核对", "1 个工作日内核对型号规格与项目场景"],
        ["3", "方案与报价", "提供选型建议、供货周期与正式报价单"],
        ["4", "合同与供货", "确认无误后签署合同，安排生产与物流"]
      ]
    },
    resources: {
      all: "全部资料",
      breadcrumb: "资料中心",
      empty: "暂无资料文件",
      eyebrow: "资料中心",
      pdf: "PDF 文档",
      subtitle: "资料来自各产品详情页挂载的技术文档，随产品数据自动同步更新。",
      title: "产品说明书、安装指南与认证证书下载"
    },
    contact: {
      breadcrumb: "联系我们",
      consultProduct: "咨询产品 ID：",
      channels: [
        ["📞", "服务热线", "400-000-0000", "实时响应"],
        ["✉️", "邮箱咨询", "sales@cloudintelworks.com", "项目资料、报价单接收"],
        ["💬", "微信咨询", "扫描二维码添加工程师", "工作日实时响应"],
        ["📝", "在线询价", "填写下方表单", "或前往询价清单批量提交"]
      ],
      faq: [
        ["提交询价后多久会有回复？", "工程师会在 1 个工作日内与您联系，确认产品型号、数量与项目场景后提供正式报价。"],
        ["是否支持海外项目与英文对接？", "支持。公司具备成熟的海外项目落地经验，可提供全英文技术资料与现场对接服务。"],
        ["可以只咨询方案，不确定具体型号吗？", "可以，直接使用左侧的通用咨询表单描述项目场景即可，工程师会协助选型。"],
        ["能否批量提交多个产品的询价？", "可以，前往询价清单页面，将产品加入清单后一次性提交。"]
      ],
      faqTitle: "常见问题",
      formDesc: "没有具体产品型号也可以直接提交，工程师会根据项目场景推荐合适的解决方案。",
      formTitle: "通用项目咨询表单",
      heroDesc: "提交您的项目需求，工程师将在 1 个工作日内与您联系；国际项目支持全英文对接。",
      heroTitle: "项目选型、报价与技术支持",
      office: "办公信息",
      officeItems: [
        ["公司名称", "云工智上（北京）科技有限公司"],
        ["办公地址", "北京市（详细地址以实际合同为准）"],
        ["响应时效", "实时响应"],
        ["国际业务", "支持英文邮件 / 视频会议对接"]
      ],
      submitLabel: "提交咨询"
    },
    staticPages: {
      about: {
        breadcrumb: "关于我们",
        title: "云工智上（北京）科技有限公司",
        subtitle: "专注高端消防管道系统、工业流体管道整体解决方案的专业化技术服务型企业",
        historyTitle: "发展历程",
        historyDesc: "唯特利百年品牌积淀，云工智上本地化专业服务",
        certTitle: "合规资质",
        certDesc: "唯特利产品体系覆盖的国际主流认证",
        certNote: "具体产品适用认证以官方证书为准，如需某型号的完整认证清单，请联系工程师索取。",
        ctaTitle: "想进一步了解公司资质或产品体系？",
        ctaDesc: "工程师可为您提供完整的公司介绍资料与产品认证清单。"
      },
      cases: {
        all: "全部案例",
        breadcrumb: "项目案例",
        emptyTag: "项目案例",
        emptySummary: "暂无案例简介",
        filters: ["商旅交通建筑", "能源核心场景", "通用工业与市政基建", "海外 EPC"],
        subtitle: "覆盖商旅交通建筑、能源核心场景、通用工业与市政基建、海外 EPC 等项目类型。",
        title: "代表性工程场景与项目经验"
      },
      industries: {
        breadcrumb: "行业应用",
        cardCta: "咨询场景方案 →",
        items: [
          ["/assets/icons/scenario-hospitality.svg", "商旅交通建筑", "酒店、机场、会展中心、商业综合体等消防机电场景。"],
          ["/assets/icons/scenario-energy.svg", "能源核心场景", "能源工程、工业厂区和高危复杂工况管道系统方案。"],
          ["/assets/icons/scenario-industrial.svg", "通用工业与市政基建", "市政基建、智慧建筑、园区管网和工业流体系统。"],
          ["/assets/icons/scenario-global.svg", "海外 EPC", "跨境供货、英文技术资料、海外现场技术落地与项目协调。"]
        ],
        subtitle: "从商旅交通建筑到海外 EPC，围绕消防管道系统与工业流体管道提供整体解决方案。",
        title: "覆盖多类型复杂工程场景"
      },
      services: {
        breadcrumb: "技术与服务",
        cardCta: "获取技术支持 →",
        items: [
          ["/assets/icons/adv-design.svg", "产品选型与技术参数确认", "结合项目场景、压力等级、管径范围和认证要求完成选型。"],
          ["/assets/icons/adv-supply.svg", "系统方案设计与深化配合", "配合设计院、总包和施工单位进行系统深化与资料确认。"],
          ["/assets/icons/adv-overseas.svg", "原厂设备供应与跨境交付", "支持国内项目供货与海外 EPC 项目的英文资料、物流和交付协调。"],
          ["/assets/icons/adv-lifecycle.svg", "现场技术支持与运维服务", "提供安装指导、技术答疑、运行维护和后续备件支持。"]
        ],
        processDesc: "从需求到报价与供货落地，一共 5 步",
        processItemDesc: "工程师跟进并确认当前阶段所需资料与下一步动作",
        processSteps: ["需求沟通", "方案选型", "报价确认", "供货交付", "技术落地"],
        processTitle: "标准服务流程",
        subtitle: "围绕产品、方案、供货、施工和运维，为项目提供连续的技术服务能力。",
        title: "从选型到落地的全流程支持"
      }
    }
  },
  en: {
    common: {
      addToQuote: "+ Add to RFQ",
      all: "All",
      backHome: "Back to Home",
      contactUs: "Contact Us",
      dataSource: "Live Data",
      dataSourceText: "This page is powered by the live Supabase project",
      download: "Download",
      featured: "Featured",
      home: "Home",
      noFile: "No file",
      noImage: "No image",
      notFoundDescription: "Please return to the homepage to continue browsing.",
      notFoundTitle: "Page Not Found",
      viewAll: "View All →",
      viewDetails: "View Details"
    },
    nav: {
      about: "About",
      cases: "Cases",
      contact: "Contact",
      home: "Home",
      industries: "Industries",
      products: "Products",
      quote: "Upload RFQ List",
      resources: "Resources",
      searchPlaceholder: "Search products / models",
      services: "Services",
      serviceHotline: "Hotline: 400-000-0000",
      switchLanguage: "中文",
      viewAll: "View All →"
    },
    footer: {
      about: "About",
      allProducts: "All Products",
      companyIntro: "Company Profile",
      contact: "Contact",
      description:
        "Focused on premium fire protection piping systems and industrial fluid piping solutions, covering product selection, supply, technical support, and lifecycle service.",
      email: "Email",
      response: "Our engineers will contact you within 1 business day.",
      serviceHotline: "Hotline",
      techSupport: "Technical Support"
    },
    home: {
      aboutBody1:
        "CloudIntel Works (Beijing) Technology Co., Ltd. is a professional technical service company serving domestic and overseas engineering projects, focused on premium fire protection piping systems and industrial fluid piping solutions.",
      aboutBody2:
        "authorized partner, responsible for sales, solution design, project support, and technical implementation for Victaulic grooved fittings, fire valves, sprinkler systems, and prefabricated piping systems.",
      aboutLede:
        "A professional technical service company for premium fire protection and industrial fluid piping solutions",
      aboutSubtitle: "CloudIntel Works (Beijing) Technology Co., Ltd.",
      aboutTitle: "Company Profile",
      browseProducts: "Browse Products",
      coreBase: "Core Manufacturing and R&D Support (Victaulic Dalian Base)",
      coreItems: [
        ["Founded", "Established in 2005, expanded in 2010"],
        ["Facility", "37,000 sqm site with 400+ employees"],
        ["Core Products", "Grooved couplings, fire fittings, sprinklers, flexible sprinkler hoses"],
        ["R&D Center", "First overseas Asia-Pacific R&D Center (ARDC) outside the United States"],
        ["Supply Network", "A core Asian supply hub serving global markets"]
      ],
      ctaBody:
        "Add products to the RFQ list from any product detail page, or submit your project request through the contact page. Our engineers will contact you within 1 business day.",
      ctaTitle: "Need product selection or technical support?",
      heroBadge: "Official authorized Victaulic® partner",
      heroBody:
        "Focused on premium fire protection piping systems and industrial fluid piping solutions, based in Beijing and serving projects nationwide and globally. We provide original international-standard equipment, system design, cross-border supply, overseas technical implementation, and lifecycle support.",
      heroTitle: "Global Quality · Lifecycle Service · Lower Project Risk",
      featuredProducts: "Featured Products",
      featuredProductsDesc: "Authorized Victaulic grooved couplings, fittings, valves, and sprinkler system products",
      introVideo: "Company Video",
      introVideoDesc: "Learn about CloudIntel Works and the global Victaulic partnership network",
      productAnchor: "Featured Products",
      videoUnsupported: "Your browser does not support video playback.",
      watchVideo: "Watch Company Video"
    },
    products: {
      activeCategory: "Category: ",
      allProducts: "All Products",
      applicationNotes: "Applications / installation notes: ",
      breadcrumb: "Products",
      categoryOverview: "Product Category Overview",
      categoryOverviewDesc: "Click any node to browse that category",
      categoryTitle: "Product Categories",
      childCategory: "Subcategory",
      clearFilters: "Clear All Filters",
      decreaseQty: "Decrease quantity",
      downloadDocuments: "Download Technical Files",
      empty: "No matching products found. Try adjusting your filters.",
      filterByAttributes: "Filter by Technical Attributes",
      increaseQty: "Increase quantity",
      inquiryDescPrefix: "Inquiry for",
      inquiryDescSuffix: "our engineer will contact you within 1 business day",
      inquiryTitle: "Request a Quote",
      keyword: "Keyword: ",
      keywordResultPrefix: "Found",
      keywordResultSuffix: "matching products",
      max: "Max",
      min: "Min",
      model: "Model / Style: ",
      noDescription: "No detailed description yet.",
      noDocuments: "No technical documents available.",
      noSpecs: "No technical specifications yet.",
      noVariants: "No variant data yet.",
      noLimit: "Any",
      overview: "Category",
      publishedNewest: "Newest",
      quoteNow: "Submit RFQ Directly",
      related: "Related Products",
      resultCountPrefix: "",
      resultCountSuffix: "products",
      searchPlaceholder: "Search products / models",
      sortModel: "Model A-Z",
      sortName: "Name A-Z",
      tabs: {
        description: "Description",
        documents: "Documents",
        specs: "Technical Specs",
        variants: "Variants"
      },
      variantName: "Variant Name"
    },
    category: {
      browseAllPrefix: "Browse All Products (",
      browseAllSuffix: ")",
      getAdvice: "Get Selection Advice",
      subcategories: "Subcategories",
      subcategoriesDesc: "Choose a subcategory to quickly find the right product series",
      subcategoryDesc: "View products and technical files under this series.",
      viewProducts: "View Products →",
      featuredDesc: "Featured products in this category",
      ctaTitle: "Need product selection advice for this category?",
      ctaDesc: "Our engineers can recommend suitable products based on your project scenario."
    },
    inquiryForm: {
      clientFileTooLarge: "The uploaded file cannot exceed 20MB. Please compress it and try again.",
      company: "Company",
      companyPlaceholder: "Enter company name",
      email: "Email",
      emailPlaceholder: "For receiving quotation emails",
      fileHint: "Supported files: csv, pdf, dwg, dxf, jpg, png. Max 20MB.",
      fileLabel: "Upload Drawing / RFQ File",
      message: "Inquiry Details",
      messagePlaceholder: "Please describe pipe size, quantity, project scenario, and other details.",
      name: "Name",
      namePlaceholder: "Enter your name",
      phone: "Phone",
      phonePlaceholder: "Enter mobile or landline number",
      submitting: "Submitting, please wait",
      submitInquiry: "Submit Inquiry"
    },
    quoteCart: {
      cartEmpty: "Your RFQ list is empty. Add products from product detail pages or fill in the form directly.",
      contactQuestion: "No specific product yet, just need solution advice?",
      contactText: "Go to Contact Page →",
      delete: "Delete",
      fileDesc: "Upload BOQ lists, CAD drawings, or PDF technical files in the form on the right. Sales engineers will receive them together with your request.",
      fileTitle: "Upload Drawings / RFQ Files",
      formTitle: "Project and Contact Information",
      inquiryList: "RFQ List:",
      pageDesc: "Confirm your list, add project information, and submit it. Our engineers will contact you within 1 business day.",
      pageTitle: "RFQ List",
      productId: "Product ID: ",
      processDesc: "Four steps from submission to formal quotation",
      processTitle: "What Happens Next",
      submitLabel: "Submit RFQ List",
      steps: [
        ["1", "Submit RFQ", "Confirm the list and project information"],
        ["2", "Engineer Review", "Review model, specifications, and project scenario within 1 business day"],
        ["3", "Solution & Quote", "Provide selection advice, lead time, and formal quotation"],
        ["4", "Contract & Supply", "Confirm details, sign contract, and arrange production and logistics"]
      ]
    },
    resources: {
      all: "All Resources",
      breadcrumb: "Resources",
      empty: "No resource files yet",
      eyebrow: "Resources",
      pdf: "PDF Documents",
      subtitle: "Documents are linked from product data and synchronized automatically.",
      title: "Download Manuals, Installation Guides, and Certificates"
    },
    contact: {
      breadcrumb: "Contact",
      channels: [
        ["📞", "Hotline", "400-000-0000", "Fast response"],
        ["✉️", "Email", "sales@cloudintelworks.com", "For project files and quotations"],
        ["💬", "WeChat", "Scan the QR code to add an engineer", "Business-day response"],
        ["📝", "Online Inquiry", "Fill in the form below", "Or submit multiple products from the RFQ list"]
      ],
      consultProduct: "Inquiry for Product ID: ",
      faq: [
        ["How soon will I receive a reply?", "Our engineers will contact you within 1 business day to confirm product models, quantities, and project scenarios."],
        ["Do you support overseas projects and English communication?", "Yes. We support overseas projects with English technical documents and coordination."],
        ["Can I ask for solution advice without a specific model?", "Yes. Describe your project scenario in the form and our engineers will help with selection."],
        ["Can I submit RFQs for multiple products at once?", "Yes. Go to the RFQ list page, add products, and submit them together."]
      ],
      faqTitle: "FAQ",
      formDesc: "You can submit a request even without a specific model. Our engineers will recommend suitable solutions based on your project scenario.",
      formTitle: "General Project Inquiry Form",
      heroDesc: "Submit your project requirements. Our engineers will contact you within 1 business day; overseas projects can be handled in English.",
      heroTitle: "Product Selection, Quotation, and Technical Support",
      office: "Office Information",
      officeItems: [
        ["Company", "CloudIntel Works (Beijing) Technology Co., Ltd."],
        ["Office Address", "Beijing, China (detailed address subject to contract)"],
        ["Response Time", "Fast response"],
        ["International Business", "English email / video meeting support"]
      ],
      submitLabel: "Submit Request"
    },
    staticPages: {
      about: {
        breadcrumb: "About",
        title: "CloudIntel Works (Beijing) Technology Co., Ltd.",
        subtitle: "A professional technical service company focused on premium fire protection piping systems and industrial fluid piping solutions",
        historyTitle: "Development History",
        historyDesc: "Victaulic's century-long brand foundation and CloudIntel Works' localized professional service",
        certTitle: "Compliance and Certifications",
        certDesc: "International mainstream certifications covered by the Victaulic product system",
        certNote: "Applicable certifications depend on official certificates for each product. Contact our engineers for a complete certification list.",
        ctaTitle: "Want to learn more about our credentials or product system?",
        ctaDesc: "Our engineers can provide company profiles and product certification lists."
      },
      cases: {
        all: "All Cases",
        breadcrumb: "Project Cases",
        emptyTag: "Project Case",
        emptySummary: "No case summary yet",
        filters: ["Hospitality & Transportation", "Energy Projects", "Industrial & Municipal", "Overseas EPC"],
        subtitle: "Covering hospitality and transportation buildings, energy projects, industrial and municipal infrastructure, and overseas EPC.",
        title: "Representative Engineering Scenarios and Project Experience"
      },
      industries: {
        breadcrumb: "Industries",
        cardCta: "Consult Scenario Solution →",
        items: [
          ["/assets/icons/scenario-hospitality.svg", "Hospitality & Transportation Buildings", "Fire protection and MEP scenarios for hotels, airports, exhibition centers, and commercial complexes."],
          ["/assets/icons/scenario-energy.svg", "Energy Projects", "Piping solutions for energy facilities, industrial plants, and demanding operating conditions."],
          ["/assets/icons/scenario-industrial.svg", "Industrial & Municipal Infrastructure", "Municipal infrastructure, smart buildings, park networks, and industrial fluid systems."],
          ["/assets/icons/scenario-global.svg", "Overseas EPC", "Cross-border supply, English technical documents, overseas implementation, and project coordination."]
        ],
        subtitle: "From hospitality and transportation buildings to overseas EPC projects, we provide integrated solutions for fire protection and industrial fluid piping.",
        title: "Solutions for Complex Engineering Scenarios"
      },
      services: {
        breadcrumb: "Technical Services",
        cardCta: "Get Technical Support →",
        items: [
          ["/assets/icons/adv-design.svg", "Product Selection and Technical Confirmation", "Select products based on project scenarios, pressure ratings, pipe sizes, and certification requirements."],
          ["/assets/icons/adv-supply.svg", "System Solution Design and Coordination", "Coordinate with design institutes, general contractors, and construction teams for design and documentation."],
          ["/assets/icons/adv-overseas.svg", "Original Supply and Cross-border Delivery", "Support domestic projects and overseas EPC projects with English documents, logistics, and delivery coordination."],
          ["/assets/icons/adv-lifecycle.svg", "On-site Technical Support and Lifecycle Service", "Provide installation guidance, technical answers, operation support, and spare parts service."]
        ],
        processDesc: "Five steps from requirements to quotation and supply",
        processItemDesc: "Our engineers follow up and confirm required materials and next actions at each stage.",
        processSteps: ["Requirement", "Selection", "Quotation", "Delivery", "Implementation"],
        processTitle: "Standard Service Process",
        subtitle: "Continuous technical service across products, solutions, supply, construction, and operations.",
        title: "End-to-end Support from Selection to Implementation"
      }
    }
  }
} as const;

export type Dictionary = (typeof dictionaries)[Locale];

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}
