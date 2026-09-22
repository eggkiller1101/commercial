import { createSupabaseServerClient } from "@/lib/supabase/server";
import { unstable_cache } from "next/cache";

export type CategoryItem = {
  description: string;
  id: string;
  productCount?: number;
  name: string;
  nameEn?: string;
  slug: string;
  subcategories?: SubcategoryItem[];
};

export type SubcategoryItem = {
  categoryId: string;
  id: string;
  name: string;
  nameEn?: string;
  productCount?: number;
  slug: string;
};

export async function getActiveCategories(): Promise<CategoryItem[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("categories")
    .select("id,name,name_en,slug,description")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) {
    console.error("Failed to load active categories", error);
    return [];
  }

  return data.map((category) => ({
    description: category.description ?? "",
    id: String(category.id),
    name: category.name,
    nameEn: category.name_en ?? undefined,
    slug: category.slug
  }));
}

export async function getActiveSubcategories(): Promise<SubcategoryItem[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("subcategories")
    .select("id,category_id,name,name_en,slug")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) {
    console.error("Failed to load active subcategories", error);
    return [];
  }

  return data.map((subcategory) => ({
    categoryId: String(subcategory.category_id),
    id: String(subcategory.id),
    name: subcategory.name,
    nameEn: subcategory.name_en ?? undefined,
    slug: subcategory.slug ?? String(subcategory.id)
  }));
}

async function loadCategoryTree(): Promise<CategoryItem[]> {
  const [categories, subcategories] = await Promise.all([
    getActiveCategories(),
    getActiveSubcategories()
  ]);

  return categories.map((category) => ({
    ...category,
    subcategories: subcategories.filter(
      (subcategory) => subcategory.categoryId === category.id
    )
  }));
}

export const getCategoryTree = unstable_cache(loadCategoryTree, ["active-category-tree"], {
  revalidate: 60,
  tags: ["categories"]
});

export async function getCategoryBySlug(
  slug: string
): Promise<CategoryItem | null> {
  const categories = await getCategoryTree();
  const category = categories.find((item) => item.slug === slug);

  if (category) {
    return category;
  }

  const subcategories = categories.flatMap((item) => item.subcategories ?? []);
  const subcategory = subcategories.find((item) => item.slug === slug);

  if (!subcategory) {
    return null;
  }

  const parent = categories.find((item) => item.id === subcategory.categoryId);

  return {
    description: parent?.description ?? "",
    id: subcategory.id,
    name: subcategory.name,
    slug: subcategory.slug,
    subcategories: []
  };
}
