import { createSupabaseServerClient } from "@/lib/supabase/server";

export type CategoryFormValues = {
  categoryId?: string;
  categoryName: string;
  description: string;
  slug: string;
};

export type CategoryListItem = {
  id: string;
  name: string;
  uploadedAt: string;
};

export type CreateCategoryInput = {
  categoryName: string;
  description: string;
  slug: string;
};

export type CreateCategoryResult =
  | {
      categoryId: string;
      ok: true;
    }
  | {
      message: string;
      ok: false;
    };

export type PaginatedCategories = {
  items: CategoryListItem[];
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

export async function createCategory(
  input: CreateCategoryInput
): Promise<CreateCategoryResult> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return {
      message: "Supabase 尚未配置，无法写入分类",
      ok: false
    };
  }

  const categoryName = input.categoryName.trim();
  const slug = createSlug(input.slug || categoryName) || `category-${Date.now()}`;

  const { data, error } = await supabase
    .from("categories")
    .insert({
      description: input.description.trim(),
      is_active: true,
      name: categoryName,
      slug
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create category in Supabase", error);

    return {
      message: error.message,
      ok: false
    };
  }

  return {
    categoryId: String(data.id),
    ok: true
  };
}

export async function getCategories(params: {
  page: number;
  pageSize: number;
}): Promise<PaginatedCategories> {
  const supabase = createSupabaseServerClient();

  if (supabase) {
    const requestedPage = Math.max(params.page, 1);
    const from = (requestedPage - 1) * params.pageSize;
    const to = from + params.pageSize - 1;
    const { count, data, error } = await supabase
      .from("categories")
      .select("id,name,created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (!error && data) {
      const total = count ?? data.length;
      const totalPages = Math.max(Math.ceil(total / params.pageSize), 1);
      const page = Math.min(requestedPage, totalPages);

      return {
        items: data.map((category) => ({
          id: String(category.id),
          name: category.name,
          uploadedAt: formatDate(category.created_at)
        })),
        page,
        pageSize: params.pageSize,
        total,
        totalPages
      };
    }

    console.error("Failed to load categories from Supabase", error);
  }

  return {
    items: [],
    page: 1,
    pageSize: params.pageSize,
    total: 0,
    totalPages: 1
  };
}

export async function getCategoryById(
  categoryId: string
): Promise<CategoryFormValues | null> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const numericId = Number(categoryId);

  if (!Number.isFinite(numericId)) {
    return null;
  }

  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,description")
    .eq("id", numericId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load category from Supabase", error);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    categoryId: String(data.id),
    categoryName: data.name,
    description: data.description ?? "",
    slug: data.slug
  };
}
