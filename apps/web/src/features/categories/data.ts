import { createSupabaseServerClient } from "@/lib/supabase/server";

// ----------------------------------------------------------------------------
// ⚠️ 真实 Supabase 库是"三级"结构，不是 schema.sql 里原始设计的"两级"：
//   categories（大类，如"管道连接解决方案"）
//     -> subcategories（子类，带 category_id 外键指回大类）
//       -> products（挂 subcategory_id，产品表本身没有 category_id 这一列）
// 这里的 getCategoryPageBySlug 会先按大类 slug 查，查不到再按子类 slug 查，
// 这样 /categories/[categorySlug] 这一个路由就能同时承载"大类页"（展示子类列表）
// 和"子类页"（展示该子类下的产品）两种情况。
// ----------------------------------------------------------------------------

export type CategoryItem = {
  description: string;
  id: string;
  name: string;
  slug: string;
};

export type SubcategoryItem = {
  categoryId: string;
  description: string;
  id: string;
  name: string;
  slug: string;
};

export type CategoryPageData =
  | {
      category: CategoryItem;
      kind: "category";
      subcategories: SubcategoryItem[];
    }
  | {
      kind: "subcategory";
      parentCategory: CategoryItem | null;
      subcategory: SubcategoryItem;
    };

export type CategoryTreeNode = CategoryItem & {
  subcategories: SubcategoryItem[];
};

/**
 * 一次性拿"大类 + 各自的子类"，用于页头 mega menu / 页脚分类导航等
 * 需要整棵树的场景，避免逐个大类再查一次子类（N+1）。
 */
export async function getCategoryTree(): Promise<CategoryTreeNode[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const [catRes, subRes] = await Promise.all([
    supabase
      .from("categories")
      .select("id,name,slug,description")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("subcategories")
      .select("id,category_id,name,slug,description")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
  ]);

  if (catRes.error || !catRes.data) {
    console.error("Failed to load category tree", catRes.error);
    return [];
  }

  if (subRes.error) {
    console.error("Failed to load subcategories for tree", subRes.error);
  }

  const subcategories = subRes.data ?? [];

  return catRes.data.map((category) => ({
    description: category.description ?? "",
    id: String(category.id),
    name: category.name,
    slug: category.slug,
    subcategories: subcategories
      .filter((sub) => sub.category_id === category.id)
      .map((sub) => ({
        categoryId: String(sub.category_id),
        description: sub.description ?? "",
        id: String(sub.id),
        name: sub.name,
        slug: sub.slug
      }))
  }));
}

export async function getActiveCategories(): Promise<CategoryItem[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,description")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error || !data) {
    console.error("Failed to load active categories", error);
    return [];
  }

  return data.map((category) => ({
    description: category.description ?? "",
    id: String(category.id),
    name: category.name,
    slug: category.slug
  }));
}

export async function getActiveSubcategories(
  categoryId: string
): Promise<SubcategoryItem[]> {
  const supabase = createSupabaseServerClient();

  const numericCategoryId = Number(categoryId);

  if (!supabase || !Number.isFinite(numericCategoryId)) {
    return [];
  }

  const { data, error } = await supabase
    .from("subcategories")
    .select("id,category_id,name,slug,description")
    .eq("category_id", numericCategoryId)
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error || !data) {
    // subcategories 是后加的表：如果 policy.sql 还没给它补上 anon 可读的
    // RLS 策略，这里会报错。不让它拖垮整个分类页——大类本身仍然正常显示。
    console.error("Failed to load active subcategories", error);
    return [];
  }

  return data.map((subcategory) => ({
    categoryId: String(subcategory.category_id),
    description: subcategory.description ?? "",
    id: String(subcategory.id),
    name: subcategory.name,
    slug: subcategory.slug
  }));
}

async function getCategoryById(categoryId: string): Promise<CategoryItem | null> {
  const supabase = createSupabaseServerClient();

  const numericId = Number(categoryId);

  if (!supabase || !Number.isFinite(numericId)) {
    return null;
  }

  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,description")
    .eq("id", numericId)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error("Failed to load category by id", error);
    }

    return null;
  }

  return {
    description: data.description ?? "",
    id: String(data.id),
    name: data.name,
    slug: data.slug
  };
}

async function getCategoryRowBySlug(slug: string): Promise<CategoryItem | null> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,description")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error("Failed to load category", error);
    }

    return null;
  }

  return {
    description: data.description ?? "",
    id: String(data.id),
    name: data.name,
    slug: data.slug
  };
}

async function getSubcategoryRowBySlug(
  slug: string
): Promise<SubcategoryItem | null> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("subcategories")
    .select("id,category_id,name,slug,description")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error("Failed to load subcategory", error);
    }

    return null;
  }

  return {
    categoryId: String(data.category_id),
    description: data.description ?? "",
    id: String(data.id),
    name: data.name,
    slug: data.slug
  };
}

/**
 * 分类页统一入口：先按大类 slug 查，查不到再按子类 slug 查。
 * 大类命中 -> 返回该大类下的子类列表（用于展示"子类导航"）。
 * 子类命中 -> 返回子类本身 + 所属大类（用于面包屑 / 返回上一级）。
 */
export async function getCategoryPageBySlug(
  slug: string
): Promise<CategoryPageData | null> {
  const category = await getCategoryRowBySlug(slug);

  if (category) {
    const subcategories = await getActiveSubcategories(category.id);

    return { category, kind: "category", subcategories };
  }

  const subcategory = await getSubcategoryRowBySlug(slug);

  if (subcategory) {
    const parentCategory = await getCategoryById(subcategory.categoryId);

    return { kind: "subcategory", parentCategory, subcategory };
  }

  return null;
}

/** @deprecated 用 getCategoryPageBySlug 代替，兼容旧调用保留。 */
export async function getCategoryBySlug(
  slug: string
): Promise<CategoryItem | null> {
  return getCategoryRowBySlug(slug);
}
