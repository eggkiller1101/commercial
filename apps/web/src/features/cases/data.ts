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
