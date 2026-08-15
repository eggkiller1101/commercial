import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ProductCardItem = {
  id: string;
  imageUrl: string | null;
  isFeatured: boolean;
  modelNumber: string;
  name: string;
  summary: string;
};

export type ProductDetail = ProductCardItem & {
  categoryName: string;
  description: string;
  images: string[];
};

// ----------------------------------------------------------------------------
// ⚠️ products 表在真实 Supabase 库里没有 category_id 这一列（这正是静态原型
// 站早期"产品页空白"的根因）。真实外键是 products.subcategory_id ->
// subcategories.id，分类名要通过 subcategories 再关联一层 categories 才能拿到。
// PostgREST 支持这种"两层内嵌资源"写法：subcategories(name, categories(name))，
// 前提是 subcategories 表本身对 subcategories.category_id -> categories.id
// 这条外键关系已经建好（当前建库脚本 schema.sql 还没补上 subcategories 的建表
// 语句，具体外键名以真实数据库为准；如果这里报"找不到关系"的错，去 Supabase
// 后台确认外键约束名，必要时改成 subcategories!<fk名>(...) 的显式写法）。
// ----------------------------------------------------------------------------

type ProductRow = {
  id: number;
  model_number: string;
  name: string;
  summary: string | null;
  description?: string | null;
  is_featured?: boolean | null;
  product_images?: Array<{ image_url: string; is_primary?: boolean | null }>;
  subcategories?: {
    name: string;
    categories?: { name: string } | null;
  } | null;
};

function mapProduct(product: ProductRow): ProductDetail {
  const images = product.product_images?.map((image) => image.image_url) ?? [];
  const categoryName =
    product.subcategories?.categories?.name ?? product.subcategories?.name ?? "";

  return {
    categoryName,
    description: product.description ?? "",
    id: String(product.id),
    imageUrl: images[0] ?? null,
    images,
    isFeatured: Boolean(product.is_featured),
    modelNumber: product.model_number,
    name: product.name,
    summary: product.summary ?? ""
  };
}

const PRODUCT_SELECT =
  "id,model_number,name,summary,description,is_featured,product_images(image_url,is_primary),subcategories(name,categories(name))";

export async function getPublishedProducts(): Promise<ProductCardItem[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Failed to load published products", error);
    return [];
  }

  return data.map((row) => mapProduct(row as unknown as ProductRow));
}

export async function getPublishedProductById(
  productId: string
): Promise<ProductDetail | null> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const numericId = Number(productId);

  if (!Number.isFinite(numericId)) {
    return null;
  }

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", numericId)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error("Failed to load published product", error);
    }

    return null;
  }

  return mapProduct(data as unknown as ProductRow);
}

export async function getProductsBySubcategoryId(
  subcategoryId: string
): Promise<ProductCardItem[]> {
  const supabase = createSupabaseServerClient();

  const numericSubcategoryId = Number(subcategoryId);

  if (!supabase || !Number.isFinite(numericSubcategoryId)) {
    return [];
  }

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("subcategory_id", numericSubcategoryId)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Failed to load products by subcategory", error);
    return [];
  }

  return data.map((row) => mapProduct(row as unknown as ProductRow));
}

/**
 * 首页"主推产品"：只取 is_featured = true 的已上架产品（跟 demo 静态站
 * DataService.getFeaturedProducts 的口径一致），不是简单地取最新 6 个。
 * 如果当前一个都没有被标记为重点推荐，就回退到最新的已上架产品，避免首页
 * 因为运营还没勾选"重点推荐"就直接空掉。
 */
export async function getFeaturedProducts(): Promise<ProductCardItem[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("status", "published")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) {
    console.error("Failed to load featured products", error);
    return (await getPublishedProducts()).slice(0, 6);
  }

  if (!data.length) {
    return (await getPublishedProducts()).slice(0, 6);
  }

  return data.map((row) => mapProduct(row as unknown as ProductRow));
}

export type ProductsSort = "newest" | "nameAsc" | "modelAsc";

export type ProductsPageQuery = {
  page?: number;
  pageSize?: number;
  q?: string;
  sort?: ProductsSort;
  subcategoryId?: string;
};

export type ProductsPageResult = {
  page: number;
  pageSize: number;
  products: ProductCardItem[];
  total: number;
};

/** ilike 用的通配符/特殊符号先转义掉，避免用户输入影响 PostgREST 过滤语法本身。 */
function escapeForIlike(value: string): string {
  return value.replace(/[%_,()]/g, "");
}

export async function getPublishedProductsPage(
  query: ProductsPageQuery
): Promise<ProductsPageResult> {
  const supabase = createSupabaseServerClient();
  const page = Math.max(1, query.page ?? 1);
  const pageSize = query.pageSize ?? 12;

  if (!supabase) {
    return { page, pageSize, products: [], total: 0 };
  }

  let request = supabase
    .from("products")
    .select(PRODUCT_SELECT, { count: "exact" })
    .eq("status", "published");

  const numericSubcategoryId = Number(query.subcategoryId);

  if (query.subcategoryId && Number.isFinite(numericSubcategoryId)) {
    request = request.eq("subcategory_id", numericSubcategoryId);
  }

  const keyword = query.q?.trim();

  if (keyword) {
    const safeKeyword = escapeForIlike(keyword);
    request = request.or(
      `name.ilike.%${safeKeyword}%,model_number.ilike.%${safeKeyword}%`
    );
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  if (query.sort === "nameAsc") {
    request = request.order("name", { ascending: true });
  } else if (query.sort === "modelAsc") {
    request = request.order("model_number", { ascending: true });
  } else {
    request = request.order("created_at", { ascending: false });
  }

  const { count, data, error } = await request.range(from, to);

  if (error || !data) {
    console.error("Failed to load products page", error);
    return { page, pageSize, products: [], total: 0 };
  }

  return {
    page,
    pageSize,
    products: data.map((row) => mapProduct(row as unknown as ProductRow)),
    total: count ?? data.length
  };
}
