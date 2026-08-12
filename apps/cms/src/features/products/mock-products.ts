export type ProductFormValues = {
  productId: string;
  productName: string;
  description: string;
  category: string;
  images: string[];
};

export const mockProductDetails: Record<string, ProductFormValues> = {
  "1": {
    productId: "CP-2026-001",
    productName: "企业产品 01",
    description:
      "企业产品 01 适用于标准商业展示场景，支持灵活配置产品图片、分类和详情描述。",
    category: "核心产品",
    images: ["product-01-front.jpeg", "product-01-detail.png"]
  },
  "2": {
    productId: "CP-2026-002",
    productName: "企业产品 02",
    description:
      "企业产品 02 面向中大型客户，重点展示产品参数、应用场景和解决方案能力。",
    category: "解决方案",
    images: ["product-02-cover.png", "product-02-scene.jpeg"]
  },
  "3": {
    productId: "CP-2026-003",
    productName: "企业产品 03",
    description:
      "企业产品 03 用于新品展示和询价转化，后续会从 Supabase 数据库读取真实内容。",
    category: "新品推荐",
    images: ["product-03-main.jpeg", "product-03-gallery.png"]
  }
};
