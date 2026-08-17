import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DocumentItem = {
  fileType: string;
  fileUrl: string;
  id: string;
  language: string;
  title: string;
  version: string;
};

export async function getPublishedDocuments(): Promise<DocumentItem[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("documents")
    .select("id,title,file_type,file_url,language,version,published_at")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false });

  if (error || !data) {
    console.error("Failed to load published documents", error);
    return [];
  }

  return data.map((document) => ({
    fileType: document.file_type,
    fileUrl: document.file_url,
    id: String(document.id),
    language: document.language,
    title: document.title,
    version: document.version ?? ""
  }));
}
