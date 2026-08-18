import {
  createSupabaseAdminClient,
  createSupabaseServerClient
} from "@/lib/supabase/server";

import type { CategoryOption } from "@/features/categories/data";

export type DocumentFormValues = {
  categoryId: string;
  documentId?: string;
  fileType: string;
  fileUrl: string | null;
  language: string;
  title: string;
  version: string;
};

export type DocumentListItem = {
  categoryName: string;
  fileUrl: string | null;
  id: string;
  name: string;
  uploadedAt: string;
};

export type CreateDocumentInput = {
  categoryId: string;
  fileType: string;
  fileUrl?: string;
  language: string;
  title: string;
  version: string;
};

export type CreateDocumentResult =
  | {
      documentId: string;
      ok: true;
    }
  | {
      message: string;
      ok: false;
    };

export type PaginatedDocuments = {
  items: DocumentListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type UpdateDocumentInput = CreateDocumentInput & {
  documentId: string;
};

export type UpdateDocumentResult = CreateDocumentResult;

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

export async function createDocument(
  input: CreateDocumentInput
): Promise<CreateDocumentResult> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      message: "Supabase service role 尚未配置，无法写入资料",
      ok: false
    };
  }

  if (!input.fileUrl?.trim()) {
    return {
      message: "资料存储尚未配置，无法生成真实资料地址",
      ok: false
    };
  }

  const categoryId = Number(input.categoryId);

  if (!Number.isFinite(categoryId)) {
    return {
      message: "资料分类 id 无效",
      ok: false
    };
  }

  const { data, error } = await supabase
    .from("documents")
    .insert({
      category_id: categoryId,
      file_type: input.fileType.trim(),
      file_url: input.fileUrl.trim(),
      language: input.language.trim() || "zh-CN",
      published_at: new Date().toISOString(),
      title: input.title.trim(),
      version: input.version.trim() || null
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create document in Supabase", error);

    return {
      message: error.message,
      ok: false
    };
  }

  return {
    documentId: String(data.id),
    ok: true
  };
}

export async function updateDocument(
  input: UpdateDocumentInput
): Promise<UpdateDocumentResult> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      message: "Supabase service role 尚未配置，无法更新资料",
      ok: false
    };
  }

  const documentId = Number(input.documentId);
  const categoryId = Number(input.categoryId);

  if (!Number.isFinite(documentId) || !Number.isFinite(categoryId)) {
    return {
      message: "资料 id 或资料分类 id 无效",
      ok: false
    };
  }

  const { error } = await supabase
    .from("documents")
    .update({
      category_id: categoryId,
      file_type: input.fileType.trim(),
      file_url: input.fileUrl?.trim() || undefined,
      language: input.language.trim() || "zh-CN",
      title: input.title.trim(),
      updated_at: new Date().toISOString(),
      version: input.version.trim() || null
    })
    .eq("id", documentId);

  if (error) {
    console.error("Failed to update document in Supabase", error);

    return {
      message: error.message,
      ok: false
    };
  }

  return {
    documentId: String(documentId),
    ok: true
  };
}

export async function getDocuments(params: {
  page: number;
  pageSize: number;
}): Promise<PaginatedDocuments> {
  const supabase = createSupabaseServerClient();

  if (supabase) {
    const requestedPage = Math.max(params.page, 1);
    const from = (requestedPage - 1) * params.pageSize;
    const to = from + params.pageSize - 1;
    const { count, data, error } = await supabase
      .from("documents")
      .select("id,title,file_url,category_id,created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (!error && data) {
      const categoryIds = Array.from(
        new Set(
          data
            .map((document) => document.category_id)
            .filter((categoryId): categoryId is number => categoryId !== null)
        )
      );
      const categoryNameMap = new Map<number, string>();

      if (categoryIds.length > 0) {
        const { data: categories, error: categoriesError } = await supabase
          .from("document_categories")
          .select("id,name")
          .in("id", categoryIds);

        if (!categoriesError && categories) {
          categories.forEach((category) => {
            categoryNameMap.set(category.id, category.name);
          });
        } else {
          console.error(
            "Failed to load document categories from Supabase",
            categoriesError
          );
        }
      }

      const total = count ?? data.length;
      const totalPages = Math.max(Math.ceil(total / params.pageSize), 1);
      const page = Math.min(requestedPage, totalPages);

      return {
        items: data.map((document) => ({
          categoryName: document.category_id
            ? categoryNameMap.get(document.category_id) ?? "未分类"
            : "未分类",
          id: String(document.id),
          fileUrl: document.file_url || null,
          name: document.title,
          uploadedAt: formatDate(document.created_at)
        })),
        page,
        pageSize: params.pageSize,
        total,
        totalPages
      };
    }

    console.error("Failed to load documents from Supabase", error);
  }

  return {
    items: [],
    page: 1,
    pageSize: params.pageSize,
    total: 0,
    totalPages: 1
  };
}

export async function getDocumentById(
  documentId: string
): Promise<DocumentFormValues | null> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const numericId = Number(documentId);

  if (!Number.isFinite(numericId)) {
    return null;
  }

  const { data, error } = await supabase
    .from("documents")
    .select("id,category_id,title,file_url,file_type,language,version")
    .eq("id", numericId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load document from Supabase", error);
    return null;
  }

  if (!data) {
    return null;
  }

  return {
    categoryId: data.category_id ? String(data.category_id) : "",
    documentId: String(data.id),
    fileType: data.file_type,
    fileUrl: data.file_url || null,
    language: data.language,
    title: data.title,
    version: data.version ?? ""
  };
}

export async function getDocumentFormOptions(): Promise<{
  categories: CategoryOption[];
}> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return {
      categories: []
    };
  }

  const { data, error } = await supabase
    .from("document_categories")
    .select("id,name")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to load document category options", error);

    return {
      categories: []
    };
  }

  return {
    categories: data.map((category) => ({
      id: String(category.id),
      name: category.name
    }))
  };
}
