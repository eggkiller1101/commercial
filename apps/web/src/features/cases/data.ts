import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CaseItem = {
  author: string;
  content: string;
  coverImageUrl: string | null;
  id: string;
  publishedAt: string | null;
  slug: string;
  summary: string;
  title: string;
};

export async function getPublishedCases(): Promise<CaseItem[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("articles")
    .select("id,title,slug,summary,content,cover_image_url,author,published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Failed to load published cases", error);
    return [];
  }

  return data.map((item) => ({
    author: item.author ?? "",
    content: item.content ?? "",
    coverImageUrl: item.cover_image_url,
    id: String(item.id),
    publishedAt: item.published_at,
    slug: item.slug,
    summary: item.summary ?? "",
    title: item.title
  }));
}

/**
 * 案例详情页用：按 slug 查一篇已发布案例。查不到（不存在 / 未发布 / 已下线）
 * 统一返回 null，详情页那边用 notFound() 处理，不在这里抛错中断渲染。
 */
export async function getCaseBySlug(slug: string): Promise<CaseItem | null> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("articles")
    .select("id,title,slug,summary,content,cover_image_url,author,published_at")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error("Failed to load case by slug", error);
    }

    return null;
  }

  return {
    author: data.author ?? "",
    content: data.content ?? "",
    coverImageUrl: data.cover_image_url,
    id: String(data.id),
    publishedAt: data.published_at,
    slug: data.slug,
    summary: data.summary ?? "",
    title: data.title
  };
}
