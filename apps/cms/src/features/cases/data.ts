import { createSupabaseAdminClient } from "@/lib/supabase/server";

export type CaseFormValues = {
  author: string;
  caseId?: string;
  category: string;
  content: string;
  coverImageUrl: string | null;
  seoDescription: string;
  seoTitle: string;
  summary: string;
  title: string;
};

export type CaseListItem = {
  id: string;
  status: string;
  title: string;
  uploadedAt: string;
};

export type SaveCaseInput = {
  author: string;
  caseId?: string;
  category: string;
  content: string;
  createdBy?: number;
  seoDescription: string;
  seoTitle: string;
  summary: string;
  title: string;
};

export type SaveCaseResult =
  | {
      caseId: string;
      ok: true;
    }
  | {
      message: string;
      ok: false;
    };

export type UpdateCaseStatusResult =
  | {
      ok: true;
    }
  | {
      message: string;
      ok: false;
    };

export type PaginatedCases = {
  items: CaseListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

const formatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit"
});

function formatDate(value: string | null) {
  if (!value) {
    return "";
  }

  return formatter.format(new Date(value));
}

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function getArticleCategoryId(categoryName: string) {
  const supabase = createSupabaseAdminClient();

  if (!supabase || !categoryName.trim()) {
    return null;
  }

  const { data, error } = await supabase
    .from("article_categories")
    .select("id")
    .eq("name", categoryName.trim())
    .maybeSingle();

  if (error) {
    console.error("Failed to load article category", error);
  }

  return data?.id ?? null;
}

export async function createCase(
  input: SaveCaseInput
): Promise<SaveCaseResult> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      message: "Supabase service role 尚未配置，无法写入案例",
      ok: false
    };
  }

  const title = input.title.trim();
  const slugBase = createSlug(title);
  const categoryId = await getArticleCategoryId(input.category);
  const { data, error } = await supabase
    .from("articles")
    .insert({
      author: input.author.trim() || null,
      category_id: categoryId,
      content: input.content.trim(),
      cover_image_url: null,
      created_by: input.createdBy ?? null,
      published_at: new Date().toISOString(),
      seo_description: input.seoDescription.trim() || input.summary.trim(),
      seo_title: input.seoTitle.trim() || title,
      slug: slugBase || `case-${Date.now()}`,
      status: "published",
      summary: input.summary.trim(),
      title
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create case in Supabase", error);

    return {
      message: error.message,
      ok: false
    };
  }

  return {
    caseId: String(data.id),
    ok: true
  };
}

export async function updateCase(
  input: SaveCaseInput & { caseId: string }
): Promise<SaveCaseResult> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      message: "Supabase service role 尚未配置，无法更新案例",
      ok: false
    };
  }

  const numericId = Number(input.caseId);

  if (!Number.isFinite(numericId)) {
    return {
      message: "案例 id 无效",
      ok: false
    };
  }

  const title = input.title.trim();
  const slugBase = createSlug(title);
  const categoryId = await getArticleCategoryId(input.category);
  const { error } = await supabase
    .from("articles")
    .update({
      author: input.author.trim() || null,
      category_id: categoryId,
      content: input.content.trim(),
      published_at: new Date().toISOString(),
      seo_description: input.seoDescription.trim() || input.summary.trim(),
      seo_title: input.seoTitle.trim() || title,
      slug: slugBase || `case-${numericId}`,
      status: "published",
      summary: input.summary.trim(),
      title
    })
    .eq("id", numericId);

  if (error) {
    console.error("Failed to update case in Supabase", error);

    return {
      message: error.message,
      ok: false
    };
  }

  return {
    caseId: String(numericId),
    ok: true
  };
}

export async function updateCaseStatus(params: {
  caseId: string;
  status: "published" | "archived";
}): Promise<UpdateCaseStatusResult> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      message: "Supabase service role 尚未配置，无法更新案例状态",
      ok: false
    };
  }

  const numericId = Number(params.caseId);

  if (!Number.isFinite(numericId)) {
    return {
      message: "案例 id 无效",
      ok: false
    };
  }

  const { error } = await supabase
    .from("articles")
    .update({ status: params.status })
    .eq("id", numericId);

  if (error) {
    console.error("Failed to update case status in Supabase", error);

    return {
      message: error.message,
      ok: false
    };
  }

  return {
    ok: true
  };
}

export async function getCases(params: {
  page: number;
  pageSize: number;
}): Promise<PaginatedCases> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      items: [],
      page: 1,
      pageSize: params.pageSize,
      total: 0,
      totalPages: 1
    };
  }

  const requestedPage = Math.max(params.page, 1);
  const from = (requestedPage - 1) * params.pageSize;
  const to = from + params.pageSize - 1;
  const { count, data, error } = await supabase
    .from("articles")
    .select("id,title,status,created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error || !data) {
    console.error("Failed to load cases from Supabase", error);

    return {
      items: [],
      page: 1,
      pageSize: params.pageSize,
      total: 0,
      totalPages: 1
    };
  }

  const total = count ?? data.length;
  const totalPages = Math.max(Math.ceil(total / params.pageSize), 1);
  const page = Math.min(requestedPage, totalPages);

  return {
    items: data.map((item) => ({
      id: String(item.id),
      status: item.status,
      title: item.title,
      uploadedAt: formatDate(item.created_at)
    })),
    page,
    pageSize: params.pageSize,
    total,
    totalPages
  };
}

export async function getCaseById(
  caseId: string
): Promise<CaseFormValues | null> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return null;
  }

  const numericId = Number(caseId);

  if (!Number.isFinite(numericId)) {
    return null;
  }

  const { data, error } = await supabase
    .from("articles")
    .select(
      "id,title,summary,content,cover_image_url,author,seo_title,seo_description,article_categories(name)"
    )
    .eq("id", numericId)
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error("Failed to load case from Supabase", error);
    }

    return null;
  }

  return {
    author: data.author ?? "",
    caseId: String(data.id),
    category: data.article_categories?.name ?? "",
    content: data.content ?? "",
    coverImageUrl: data.cover_image_url,
    seoDescription: data.seo_description ?? "",
    seoTitle: data.seo_title ?? "",
    summary: data.summary ?? "",
    title: data.title
  };
}
