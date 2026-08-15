import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CategoryItem = {
  description: string;
  id: string;
  name: string;
  slug: string;
};

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

export async function getCategoryBySlug(
  slug: string
): Promise<CategoryItem | null> {
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
