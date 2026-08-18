import {
  createSupabaseAdminClient,
  createSupabaseServerClient
} from "@/lib/supabase/server";

export type CategoryFormValues = {
  categoryId?: string;
  categoryName: string;
  description: string;
  slug: string;
};

export type SubcategoryFormValues = {
  categoryId: string;
  slug: string;
  subcategoryId?: string;
  subcategoryName: string;
};

export type CategoryListItem = {
  id: string;
  name: string;
  uploadedAt: string;
};

export type SubcategoryListItem = {
  categoryName: string;
  id: string;
  name: string;
  uploadedAt: string;
};

export type DocumentCategoryFormValues = {
  documentCategoryId?: string;
  name: string;
  slug: string;
};

export type DocumentCategoryListItem = {
  id: string;
  name: string;
  slug: string;
  uploadedAt: string;
};

export type CategoryOption = {
  id: string;
  name: string;
};

export type CreateCategoryInput = {
  categoryName: string;
  description: string;
  slug: string;
};

export type UpdateCategoryInput = CreateCategoryInput & {
  categoryId: string;
};

export type CreateSubcategoryInput = {
  categoryId: string;
  slug: string;
  subcategoryName: string;
};

export type UpdateSubcategoryInput = CreateSubcategoryInput & {
  subcategoryId: string;
};

export type CreateDocumentCategoryInput = {
  name: string;
  slug: string;
};

export type UpdateDocumentCategoryInput = CreateDocumentCategoryInput & {
  documentCategoryId: string;
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

export type CreateSubcategoryResult =
  | {
      ok: true;
      subcategoryId: string;
    }
  | {
      message: string;
      ok: false;
    };

export type UpdateCategoryResult = CreateCategoryResult;
export type UpdateSubcategoryResult = CreateSubcategoryResult;

export type DocumentCategoryResult =
  | {
      documentCategoryId: string;
      ok: true;
    }
  | {
      message: string;
      ok: false;
    };

export type UpdateDocumentCategoryResult = DocumentCategoryResult;

export type PaginatedCategories = {
  items: CategoryListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type PaginatedSubcategories = {
  items: SubcategoryListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type PaginatedDocumentCategories = {
  items: DocumentCategoryListItem[];
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
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      message: "Supabase service role 尚未配置，无法写入分类",
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

export async function updateCategory(
  input: UpdateCategoryInput
): Promise<UpdateCategoryResult> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      message: "Supabase service role 尚未配置，无法更新分类",
      ok: false
    };
  }

  const numericId = Number(input.categoryId);

  if (!Number.isFinite(numericId)) {
    return {
      message: "分类 id 无效",
      ok: false
    };
  }

  const categoryName = input.categoryName.trim();
  const slug = createSlug(input.slug || categoryName) || `category-${numericId}`;

  const { error } = await supabase
    .from("categories")
    .update({
      description: input.description.trim(),
      is_active: true,
      name: categoryName,
      slug,
      updated_at: new Date().toISOString()
    })
    .eq("id", numericId);

  if (error) {
    console.error("Failed to update category in Supabase", error);

    return {
      message: error.message,
      ok: false
    };
  }

  return {
    categoryId: String(numericId),
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

export async function getCategoryOptions(): Promise<CategoryOption[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("categories")
    .select("id,name")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to load category options from Supabase", error);
    return [];
  }

  return data.map((category) => ({
    id: String(category.id),
    name: category.name
  }));
}

export async function createSubcategory(
  input: CreateSubcategoryInput
): Promise<CreateSubcategoryResult> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      message: "Supabase service role 尚未配置，无法写入二级分类",
      ok: false
    };
  }

  const categoryId = Number(input.categoryId);

  if (!Number.isFinite(categoryId)) {
    return {
      message: "一级分类 id 无效",
      ok: false
    };
  }

  const subcategoryName = input.subcategoryName.trim();
  const slug =
    createSlug(input.slug || subcategoryName) || `subcategory-${Date.now()}`;

  const { data, error } = await supabase
    .from("subcategories")
    .insert({
      category_id: categoryId,
      is_active: true,
      name: subcategoryName,
      slug
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create subcategory in Supabase", error);

    return {
      message: error.message,
      ok: false
    };
  }

  return {
    ok: true,
    subcategoryId: String(data.id)
  };
}

export async function updateSubcategory(
  input: UpdateSubcategoryInput
): Promise<UpdateSubcategoryResult> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      message: "Supabase service role 尚未配置，无法更新二级分类",
      ok: false
    };
  }

  const categoryId = Number(input.categoryId);
  const subcategoryId = Number(input.subcategoryId);

  if (!Number.isFinite(categoryId) || !Number.isFinite(subcategoryId)) {
    return {
      message: "分类 id 无效",
      ok: false
    };
  }

  const subcategoryName = input.subcategoryName.trim();
  const slug =
    createSlug(input.slug || subcategoryName) || `subcategory-${subcategoryId}`;

  const { error } = await supabase
    .from("subcategories")
    .update({
      category_id: categoryId,
      is_active: true,
      name: subcategoryName,
      slug,
      updated_at: new Date().toISOString()
    })
    .eq("id", subcategoryId);

  if (error) {
    console.error("Failed to update subcategory in Supabase", error);

    return {
      message: error.message,
      ok: false
    };
  }

  return {
    ok: true,
    subcategoryId: String(subcategoryId)
  };
}

export async function getSubcategories(params: {
  page: number;
  pageSize: number;
}): Promise<PaginatedSubcategories> {
  const supabase = createSupabaseServerClient();

  if (supabase) {
    const requestedPage = Math.max(params.page, 1);
    const from = (requestedPage - 1) * params.pageSize;
    const to = from + params.pageSize - 1;
    const { count, data, error } = await supabase
      .from("subcategories")
      .select("id,name,created_at,categories(name)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (!error && data) {
      const total = count ?? data.length;
      const totalPages = Math.max(Math.ceil(total / params.pageSize), 1);
      const page = Math.min(requestedPage, totalPages);

      return {
        items: data.map((subcategory) => ({
          categoryName: subcategory.categories?.name ?? "",
          id: String(subcategory.id),
          name: subcategory.name,
          uploadedAt: formatDate(subcategory.created_at)
        })),
        page,
        pageSize: params.pageSize,
        total,
        totalPages
      };
    }

    console.error("Failed to load subcategories from Supabase", error);
  }

  return {
    items: [],
    page: 1,
    pageSize: params.pageSize,
    total: 0,
    totalPages: 1
  };
}

export async function getSubcategoryById(
  subcategoryId: string
): Promise<SubcategoryFormValues | null> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const numericId = Number(subcategoryId);

  if (!Number.isFinite(numericId)) {
    return null;
  }

  const { data, error } = await supabase
    .from("subcategories")
    .select("id,category_id,name,slug")
    .eq("id", numericId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load subcategory from Supabase", error);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    categoryId: String(data.category_id),
    slug: data.slug ?? "",
    subcategoryId: String(data.id),
    subcategoryName: data.name
  };
}

export async function getDocumentCategories(params: {
  page: number;
  pageSize: number;
}): Promise<PaginatedDocumentCategories> {
  const supabase = createSupabaseServerClient();

  if (supabase) {
    const requestedPage = Math.max(params.page, 1);
    const from = (requestedPage - 1) * params.pageSize;
    const to = from + params.pageSize - 1;
    const { count, data, error } = await supabase
      .from("document_categories")
      .select("id,name,slug,created_at", { count: "exact" })
      .order("sort_order", { ascending: true })
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
          slug: category.slug,
          uploadedAt: formatDate(category.created_at)
        })),
        page,
        pageSize: params.pageSize,
        total,
        totalPages
      };
    }

    console.error("Failed to load document categories from Supabase", error);
  }

  return {
    items: [],
    page: 1,
    pageSize: params.pageSize,
    total: 0,
    totalPages: 1
  };
}

export async function getDocumentCategoryById(
  documentCategoryId: string
): Promise<DocumentCategoryFormValues | null> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const numericId = Number(documentCategoryId);

  if (!Number.isFinite(numericId)) {
    return null;
  }

  const { data, error } = await supabase
    .from("document_categories")
    .select("id,name,slug")
    .eq("id", numericId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load document category from Supabase", error);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    documentCategoryId: String(data.id),
    name: data.name,
    slug: data.slug
  };
}

export async function getDocumentCategoryOptions(): Promise<CategoryOption[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("document_categories")
    .select("id,name")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to load document category options", error);
    return [];
  }

  return data.map((category) => ({
    id: String(category.id),
    name: category.name
  }));
}

export async function createDocumentCategory(
  input: CreateDocumentCategoryInput
): Promise<DocumentCategoryResult> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      message: "Supabase service role 尚未配置，无法写入资料分类",
      ok: false
    };
  }

  const name = input.name.trim();
  const slug = createSlug(input.slug || name) || `document-category-${Date.now()}`;

  const { data, error } = await supabase
    .from("document_categories")
    .insert({
      name,
      slug
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create document category in Supabase", error);

    return {
      message: error.message,
      ok: false
    };
  }

  return {
    documentCategoryId: String(data.id),
    ok: true
  };
}

export async function updateDocumentCategory(
  input: UpdateDocumentCategoryInput
): Promise<UpdateDocumentCategoryResult> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      message: "Supabase service role 尚未配置，无法更新资料分类",
      ok: false
    };
  }

  const numericId = Number(input.documentCategoryId);

  if (!Number.isFinite(numericId)) {
    return {
      message: "资料分类 id 无效",
      ok: false
    };
  }

  const name = input.name.trim();
  const slug = createSlug(input.slug || name) || `document-category-${numericId}`;

  const { error } = await supabase
    .from("document_categories")
    .update({
      name,
      slug
    })
    .eq("id", numericId);

  if (error) {
    console.error("Failed to update document category in Supabase", error);

    return {
      message: error.message,
      ok: false
    };
  }

  return {
    documentCategoryId: String(numericId),
    ok: true
  };
}
