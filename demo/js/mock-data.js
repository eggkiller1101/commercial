/**
 * mock-data.js
 * ----------------------------------------------------------------------------
 * 内嵌的模拟数据，字段名 1:1 对齐仓库根目录 schema.sql 里的表结构
 * （categories / products / product_images / attribute_definitions /
 *   product_attribute_values / product_variants / documents / product_documents）。
 *
 * 为什么字段名要跟数据库表一模一样？
 * 因为 js/data-service.js 里访问真实 Supabase 时，查询出来的行也是这个形状。
 * 只要形状一致，data-service.js 里"把原始行 map 成页面要用的视图模型"那部分
 * 代码，不管数据来自这里还是来自 Supabase，都不用改一行。
 * 这跟 apps/cms/src/features/products/data.ts 里 mapProductDetail() 的思路完全一样。
 *
 * 等你在 js/config.js 填上真实的 SUPABASE_URL / SUPABASE_ANON_KEY，
 * 这个文件就不会再被用到（可以直接删掉，或者留着当本地开发的离线数据）。
 */

const MOCK_CATEGORIES = [
  {
    id: 1,
    parent_id: null,
    name: "管道连接解决方案",
    slug: "pipe-joining-solutions",
    description: "覆盖沟槽式卡箍、管件、法兰接头等机械式管道连接产品系列，适用于给排水、暖通、消防等工程管路系统。",
    icon_url: "assets/icons/fitting.svg",
    banner_image_url: null,
    sort_order: 1
  },
  {
    id: 2,
    parent_id: 1,
    name: "沟槽式卡箍",
    slug: "grooved-couplings",
    description: "适用于多种管径与压力等级的沟槽式挠性 / 刚性卡箍，安装快捷、密封可靠，免焊接施工。",
    icon_url: "assets/icons/coupling.svg",
    banner_image_url: null,
    sort_order: 1
  },
  {
    id: 3,
    parent_id: 1,
    name: "沟槽式管件",
    slug: "grooved-fittings",
    description: "弯头、三通、异径接头等沟槽式管件，与卡箍配套使用，覆盖常见管路转向与分支场景。",
    icon_url: "assets/icons/fitting.svg",
    banner_image_url: null,
    sort_order: 2
  },
  {
    id: 4,
    parent_id: 1,
    name: "法兰接头",
    slug: "flange-adapters",
    description: "沟槽端到法兰端的过渡连接件，方便与阀门、水泵等法兰设备对接。",
    icon_url: "assets/icons/valve.svg",
    banner_image_url: null,
    sort_order: 3
  },
  {
    id: 5,
    parent_id: null,
    name: "消防解决方案",
    slug: "fire-protection-solutions",
    description: "消防喷淋头、信号阀、水流指示器等消防管路系统产品系列，满足自动喷水灭火系统设计规范要求。",
    icon_url: "assets/icons/sprinkler.svg",
    banner_image_url: null,
    sort_order: 2
  },
  {
    id: 6,
    parent_id: 5,
    name: "喷淋头",
    slug: "sprinkler-heads",
    description: "玻璃球 / 易熔合金喷头，覆盖直立型、下垂型、边墙型等多种安装方式。",
    icon_url: "assets/icons/sprinkler.svg",
    banner_image_url: null,
    sort_order: 1
  },
  {
    id: 7,
    parent_id: 5,
    name: "控制阀组",
    slug: "control-valve-sets",
    description: "信号蝶阀、水流指示器等消防系统监测与控制部件。",
    icon_url: "assets/icons/valve.svg",
    banner_image_url: null,
    sort_order: 2
  }
];

// 按分类定义"可筛选的技术参数"，对应 attribute_definitions 表。
// is_filterable = true 的会出现在产品列表页左侧的筛选器里。
const MOCK_ATTRIBUTE_DEFINITIONS = [
  { id: 1, category_id: 2, code: "pipe_diameter", name: "适用管径", unit: "mm", data_type: "number", is_filterable: true, sort_order: 1 },
  { id: 2, category_id: 2, code: "rated_pressure", name: "额定工作压力", unit: "MPa", data_type: "number", is_filterable: true, sort_order: 2 },
  { id: 3, category_id: 2, code: "material", name: "材质", unit: null, data_type: "enum", is_filterable: true, sort_order: 3 },

  { id: 4, category_id: 3, code: "pipe_diameter", name: "适用管径", unit: "mm", data_type: "number", is_filterable: true, sort_order: 1 },
  { id: 5, category_id: 3, code: "material", name: "材质", unit: null, data_type: "enum", is_filterable: true, sort_order: 2 },

  { id: 6, category_id: 4, code: "pipe_diameter", name: "适用管径", unit: "mm", data_type: "number", is_filterable: true, sort_order: 1 },
  { id: 7, category_id: 4, code: "pressure_class", name: "压力等级", unit: null, data_type: "enum", is_filterable: true, sort_order: 2 },

  { id: 8, category_id: 6, code: "response_type", name: "响应类型", unit: null, data_type: "enum", is_filterable: true, sort_order: 1 },
  { id: 9, category_id: 6, code: "rated_temperature", name: "公称动作温度", unit: "°C", data_type: "number", is_filterable: true, sort_order: 2 },
  { id: 10, category_id: 6, code: "install_type", name: "安装方式", unit: null, data_type: "enum", is_filterable: true, sort_order: 3 },

  { id: 11, category_id: 7, code: "body_material", name: "阀体材质", unit: null, data_type: "enum", is_filterable: true, sort_order: 1 },
  { id: 12, category_id: 7, code: "rated_pressure", name: "公称压力", unit: "MPa", data_type: "number", is_filterable: true, sort_order: 2 }
];

function attrValues(pairs) {
  // pairs: [[attribute_definition_id, value_text_or_number], ...]
  return pairs.map(([attribute_definition_id, value]) => ({
    attribute_definition_id,
    value_text: typeof value === "string" ? value : null,
    value_number: typeof value === "number" ? value : null
  }));
}

const MOCK_PRODUCTS = [
  {
    id: 101,
    category_id: 2,
    model_number: "Style-77",
    name: "标准沟槽式挠性卡箍",
    slug: "style-77-flexible-coupling",
    summary: "适用于多种管径的标准挠性沟槽式卡箍，安装快捷，密封可靠，可吸收管道热胀冷缩与轻微振动。",
    description:
      "Style-77 挠性卡箍是管路系统中应用最广泛的沟槽式连接件之一，采用可锻铸铁壳体与合成橡胶密封圈，" +
      "无需焊接或法兰即可完成管道连接，大幅缩短施工周期。挠性结构可吸收管道因温度变化产生的热胀冷缩，" +
      "同时具备一定的抗振与角偏转能力，适用于给排水、暖通空调等常规管路系统。",
    application_notes: "适用于室内外给排水管路、暖通空调水系统的直管连接，安装前需确认管端沟槽尺寸符合标准。",
    status: "published",
    is_featured: true,
    view_count: 1280,
    attribute_values: attrValues([[1, 100], [2, 1.6], [3, "可锻铸铁"]]),
    images: [
      { image_url: "assets/icons/coupling.svg", alt_text: "Style-77 标准沟槽式挠性卡箍", is_primary: true, sort_order: 1 },
      { image_url: "assets/icons/coupling.svg", alt_text: "Style-77 安装示意", is_primary: false, sort_order: 2 }
    ],
    variants: [
      { sku: "STY77-DN50", variant_name: "DN50 (2英寸)", extra_attributes: { 中心到端面尺寸: "89mm" } },
      { sku: "STY77-DN100", variant_name: "DN100 (4英寸)", extra_attributes: { 中心到端面尺寸: "102mm" } },
      { sku: "STY77-DN150", variant_name: "DN150 (6英寸)", extra_attributes: { 中心到端面尺寸: "121mm" } }
    ],
    documents: [
      { title: "Style-77 产品说明书", file_url: "#", file_type: "pdf", file_size_bytes: 812000 },
      { title: "Style-77 卡箍安装指南", file_url: "#", file_type: "pdf", file_size_bytes: 1340000 }
    ]
  },
  {
    id: 102,
    category_id: 2,
    model_number: "Style-07",
    name: "07型 Zero-Flex 刚性卡箍",
    slug: "style-07-rigid-coupling",
    summary: "刚性连接结构，限制管道轴向位移与角偏转，适用于需要管路系统整体刚性的场合。",
    description:
      "Style-07 刚性卡箍通过特殊的锁定式沟槽设计，将两端管道牢固锁定为近似刚性整体，" +
      "能够有效限制管道的轴向位移与角度偏转，常用于需要控制管路整体刚性的机房、消防主管等场景。",
    application_notes: "常用于消防主管网、需要限制管道位移的机房管路，安装时需保证沟槽宽度与深度符合标准公差。",
    status: "published",
    is_featured: false,
    view_count: 640,
    attribute_values: attrValues([[1, 150], [2, 2.1], [3, "球墨铸铁"]]),
    images: [
      { image_url: "assets/icons/coupling.svg", alt_text: "Style-07 刚性沟槽式卡箍", is_primary: true, sort_order: 1 }
    ],
    variants: [
      { sku: "STY07-DN80", variant_name: "DN80 (3英寸)", extra_attributes: {} },
      { sku: "STY07-DN150", variant_name: "DN150 (6英寸)", extra_attributes: {} }
    ],
    documents: [{ title: "Style-07 产品说明书", file_url: "#", file_type: "pdf", file_size_bytes: 760000 }]
  },
  {
    id: 103,
    category_id: 2,
    model_number: "Style-31",
    name: "同心异径沟槽式卡箍",
    slug: "style-31-reducing-coupling",
    summary: "一步完成变径与连接，减少一个管件的使用，适合管径过渡处的快速施工。",
    description: "Style-31 同心异径卡箍将异径接头与卡箍功能合二为一，在管径变化处一次安装即可完成连接与变径，减少管件数量与接口。",
    application_notes: "适用于泵房、管廊等需要频繁变径的管路节点。",
    status: "published",
    is_featured: false,
    view_count: 320,
    attribute_values: attrValues([[1, 80], [2, 1.2], [3, "可锻铸铁"]]),
    images: [{ image_url: "assets/icons/coupling.svg", alt_text: "Style-31 同心异径卡箍", is_primary: true, sort_order: 1 }],
    variants: [{ sku: "STY31-DN65-50", variant_name: "DN65 → DN50", extra_attributes: {} }],
    documents: [{ title: "Style-31 产品说明书", file_url: "#", file_type: "pdf", file_size_bytes: 690000 }]
  },
  {
    id: 104,
    category_id: 2,
    model_number: "Style-005",
    name: "整体式沟槽卡箍",
    slug: "style-005-integral-coupling",
    summary: "单螺栓设计，安装工具更少、速度更快，适合大批量标准管路的快速施工。",
    description: "Style-005 采用整体式单螺栓锁紧结构，相比传统双螺栓卡箍安装步骤更少，特别适合大批量标准管径管路的快速批量施工场景。",
    application_notes: "适用于批量标准化管路施工，例如成排喷淋支管。",
    status: "published",
    is_featured: false,
    view_count: 210,
    attribute_values: attrValues([[1, 32], [2, 1.2], [3, "碳钢"]]),
    images: [{ image_url: "assets/icons/coupling.svg", alt_text: "Style-005 整体式卡箍", is_primary: true, sort_order: 1 }],
    variants: [{ sku: "STY005-DN32", variant_name: "DN32 (1英寸)", extra_attributes: {} }],
    documents: []
  },

  {
    id: 105,
    category_id: 3,
    model_number: "FIT-90E",
    name: "沟槽式90°弯头",
    slug: "grooved-90-elbow",
    summary: "标准90°转向管件，两端沟槽设计，配合卡箍完成管路方向转换。",
    description: "沟槽式90°弯头用于管路走向转换，两端采用标准沟槽设计，与本系列卡箍配套使用，安装无需焊接。",
    application_notes: "用于管路直角转弯节点。",
    status: "published",
    is_featured: true,
    view_count: 540,
    attribute_values: attrValues([[4, 100], [5, "可锻铸铁"]]),
    images: [{ image_url: "assets/icons/fitting.svg", alt_text: "沟槽式90°弯头", is_primary: true, sort_order: 1 }],
    variants: [{ sku: "FIT90-DN100", variant_name: "DN100 (4英寸)", extra_attributes: {} }],
    documents: [{ title: "沟槽管件产品手册", file_url: "#", file_type: "pdf", file_size_bytes: 980000 }]
  },
  {
    id: 106,
    category_id: 3,
    model_number: "FIT-TEE",
    name: "沟槽式三通",
    slug: "grooved-tee",
    summary: "标准等径三通，用于管路分支节点。",
    description: "沟槽式三通用于主管路上引出支管，三个接口均为标准沟槽端，安装与检修便捷。",
    application_notes: "用于管路分支节点，如支管接出。",
    status: "published",
    is_featured: false,
    view_count: 300,
    attribute_values: attrValues([[4, 150], [5, "球墨铸铁"]]),
    images: [{ image_url: "assets/icons/fitting.svg", alt_text: "沟槽式三通", is_primary: true, sort_order: 1 }],
    variants: [{ sku: "FITTEE-DN150", variant_name: "DN150 (6英寸)", extra_attributes: {} }],
    documents: []
  },
  {
    id: 107,
    category_id: 3,
    model_number: "FIT-RED",
    name: "沟槽式异径接头",
    slug: "grooved-reducer",
    summary: "用于两个不同管径之间的沟槽式过渡连接。",
    description: "沟槽式异径接头用于两个不同管径管道之间的平滑过渡，两端均为标准沟槽设计。",
    application_notes: "用于变径节点。",
    status: "published",
    is_featured: false,
    view_count: 150,
    attribute_values: attrValues([[4, 65], [5, "可锻铸铁"]]),
    images: [{ image_url: "assets/icons/fitting.svg", alt_text: "沟槽式异径接头", is_primary: true, sort_order: 1 }],
    variants: [{ sku: "FITRED-DN65-50", variant_name: "DN65 → DN50", extra_attributes: {} }],
    documents: []
  },

  {
    id: 108,
    category_id: 4,
    model_number: "FA-100",
    name: "沟槽转法兰接头 FA-100",
    slug: "flange-adapter-fa-100",
    summary: "一端沟槽、一端标准法兰，方便与阀门、水泵等法兰设备对接。",
    description: "FA-100 法兰接头一端为沟槽式连接，另一端为标准法兰盘，用于沟槽管路系统与法兰式设备（如阀门、水泵）之间的过渡对接。",
    application_notes: "用于管路与法兰式设备的对接节点，如水泵进出口。",
    status: "published",
    is_featured: false,
    view_count: 260,
    attribute_values: attrValues([[6, 100], [7, "PN16"]]),
    images: [{ image_url: "assets/icons/valve.svg", alt_text: "沟槽转法兰接头 FA-100", is_primary: true, sort_order: 1 }],
    variants: [{ sku: "FA100-DN100-PN16", variant_name: "DN100 / PN16", extra_attributes: {} }],
    documents: [{ title: "法兰接头产品说明书", file_url: "#", file_type: "pdf", file_size_bytes: 540000 }]
  },
  {
    id: 109,
    category_id: 4,
    model_number: "FA-150",
    name: "沟槽转法兰接头 FA-150",
    slug: "flange-adapter-fa-150",
    summary: "大口径沟槽转法兰接头，适用于水泵房主管路对接。",
    description: "FA-150 适用于较大口径管路与法兰式设备的对接场景，结构与 FA-100 一致，规格更大。",
    application_notes: "用于水泵房主管路对接节点。",
    status: "published",
    is_featured: false,
    view_count: 120,
    attribute_values: attrValues([[6, 150], [7, "PN16"]]),
    images: [{ image_url: "assets/icons/valve.svg", alt_text: "沟槽转法兰接头 FA-150", is_primary: true, sort_order: 1 }],
    variants: [{ sku: "FA150-DN150-PN16", variant_name: "DN150 / PN16", extra_attributes: {} }],
    documents: []
  },

  {
    id: 110,
    category_id: 6,
    model_number: "SP-68",
    name: "直立型玻璃球洒水喷头",
    slug: "sprinkler-sp-68-upright",
    summary: "玻璃球感温元件，直立安装，适用于自动喷水灭火系统标准场所。",
    description:
      "SP-68 采用玻璃球感温元件，公称动作温度 68°C，直立型安装方式，适用于自动喷水灭火系统中的" +
      "轻危险级、中危险级场所，需按照 GB 50084 等相关消防设计规范选型安装。",
    application_notes: "适用于办公、商业等轻中危险级场所的吊顶下方直立安装。",
    status: "published",
    is_featured: true,
    view_count: 980,
    attribute_values: attrValues([[8, "玻璃球"], [9, 68], [10, "直立型"]]),
    images: [{ image_url: "assets/icons/sprinkler.svg", alt_text: "SP-68 直立型喷头", is_primary: true, sort_order: 1 }],
    variants: [{ sku: "SP68-K80", variant_name: "K80 直立型", extra_attributes: {} }],
    documents: [
      { title: "SP-68 产品说明书", file_url: "#", file_type: "pdf", file_size_bytes: 430000 },
      { title: "消防产品认证证书", file_url: "#", file_type: "pdf", file_size_bytes: 220000 }
    ]
  },
  {
    id: 111,
    category_id: 6,
    model_number: "SP-93",
    name: "下垂型易熔合金洒水喷头",
    slug: "sprinkler-sp-93-pendent",
    summary: "易熔合金感温元件，下垂安装，公称动作温度93°C，适用于中高温环境场所。",
    description: "SP-93 采用易熔合金感温元件，公称动作温度 93°C，下垂型安装，适用于厨房、锅炉房等环境温度较高的场所。",
    application_notes: "适用于厨房、机房等环境温度较高场所的下垂安装。",
    status: "published",
    is_featured: false,
    view_count: 410,
    attribute_values: attrValues([[8, "易熔合金"], [9, 93], [10, "下垂型"]]),
    images: [{ image_url: "assets/icons/sprinkler.svg", alt_text: "SP-93 下垂型喷头", is_primary: true, sort_order: 1 }],
    variants: [{ sku: "SP93-K80", variant_name: "K80 下垂型", extra_attributes: {} }],
    documents: []
  },
  {
    id: 112,
    category_id: 6,
    model_number: "SP-79",
    name: "边墙型玻璃球洒水喷头",
    slug: "sprinkler-sp-79-sidewall",
    summary: "边墙水平安装，适用于走廊、客房等不便吊顶安装的场所。",
    description: "SP-79 为边墙型喷头，安装于墙面而非吊顶，喷洒角度经过特殊设计，适用于走廊、酒店客房等场所。",
    application_notes: "适用于走廊、客房等边墙安装场景。",
    status: "published",
    is_featured: false,
    view_count: 175,
    attribute_values: attrValues([[8, "玻璃球"], [9, 68], [10, "边墙型"]]),
    images: [{ image_url: "assets/icons/sprinkler.svg", alt_text: "SP-79 边墙型喷头", is_primary: true, sort_order: 1 }],
    variants: [{ sku: "SP79-K80", variant_name: "K80 边墙型", extra_attributes: {} }],
    documents: []
  },

  {
    id: 113,
    category_id: 7,
    model_number: "CV-200",
    name: "沟槽式信号蝶阀",
    slug: "control-valve-cv-200",
    summary: "带阀位信号反馈的蝶阀，用于消防管路系统的阀门状态监测。",
    description: "CV-200 信号蝶阀在标准沟槽式蝶阀基础上增加了阀位信号反馈装置，可将阀门开关状态传输至消防控制室，满足系统联动监测要求。",
    application_notes: "安装于消防主管、支管的关键阀门节点，需接入消防联动控制系统。",
    status: "published",
    is_featured: true,
    view_count: 730,
    attribute_values: attrValues([[11, "球墨铸铁"], [12, 1.6]]),
    images: [{ image_url: "assets/icons/valve.svg", alt_text: "CV-200 沟槽式信号蝶阀", is_primary: true, sort_order: 1 }],
    variants: [{ sku: "CV200-DN100", variant_name: "DN100", extra_attributes: {} }],
    documents: [{ title: "CV-200 产品说明书", file_url: "#", file_type: "pdf", file_size_bytes: 610000 }]
  },
  {
    id: 115,
    category_id: 7,
    model_number: "AV-700",
    name: "湿式报警阀组",
    slug: "wet-alarm-check-valve-set",
    summary: "自动喷水灭火系统核心报警组件，探测管网水流并触发机械 / 电气报警，联动消防控制室。",
    description:
      "湿式报警阀组安装于消防主管路，系统动作出水时通过阀瓣压差驱动水力警铃机械报警，并联动压力开关输出电信号至消防控制室，" +
      "是湿式自动喷水灭火系统的核心监测部件之一。",
    application_notes: "安装于消防水泵房或各楼层配水干管起始处，需按规范配套延迟器、水力警铃、压力开关等附件。",
    status: "published",
    is_featured: true,
    view_count: 480,
    attribute_values: attrValues([[11, "球墨铸铁"], [12, 1.6]]),
    images: [{ image_url: "assets/icons/valve.svg", alt_text: "湿式报警阀组", is_primary: true, sort_order: 1 }],
    variants: [{ sku: "AV700-DN100", variant_name: "DN100", extra_attributes: {} }],
    documents: [{ title: "湿式报警阀组产品说明书", file_url: "#", file_type: "pdf", file_size_bytes: 705000 }]
  },
  {
    id: 114,
    category_id: 7,
    model_number: "CV-210",
    name: "沟槽式水流指示器",
    slug: "control-valve-cv-210",
    summary: "检测管道内水流动作并输出电信号，用于自动喷水灭火系统分区监测。",
    description: "CV-210 水流指示器安装于消防管路分支处，当系统动作产生水流时输出电信号至消防控制室，实现分区报警定位。",
    application_notes: "安装于各楼层 / 防火分区的配水干管上。",
    status: "published",
    is_featured: false,
    view_count: 260,
    attribute_values: attrValues([[11, "黄铜"], [12, 1.2]]),
    images: [{ image_url: "assets/icons/valve.svg", alt_text: "CV-210 水流指示器", is_primary: true, sort_order: 1 }],
    variants: [{ sku: "CV210-DN100", variant_name: "DN100", extra_attributes: {} }],
    documents: []
  }
];

window.MOCK_DB = {
  categories: MOCK_CATEGORIES,
  attributeDefinitions: MOCK_ATTRIBUTE_DEFINITIONS,
  products: MOCK_PRODUCTS
};
