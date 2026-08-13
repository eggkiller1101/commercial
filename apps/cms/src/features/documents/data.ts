import {
  createSupabaseAdminClient,
  createSupabaseServerClient
} from "@/lib/supabase/server";

export type DocumentFormValues = {
  documentId?: string;
  fileType: string;
  fileUrl: string | null;
  language: string;
  title: string;
  version: string;
};

export type DocumentListItem = {
  id: string;
  name: string;
  uploadedAt: string;
};

export type CreateDocumentInput = {
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
      message: "Supabase service role 尚未配置，无法写入文件",
      ok: false
    };
  }

  if (!input.fileUrl?.trim()) {
    return {
      message: "文件存储尚未配置，无法生成真实文件地址",
      ok: false
    };
  }

  const { data, error } = await supabase
    .from("documents")
    .insert({
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
      .select("id,title,created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (!error && data) {
      const total = count ?? data.length;
      const totalPages = Math.max(Math.ceil(total / params.pageSize), 1);
      const page = Math.min(requestedPage, totalPages);

      return {
        items: data.map((document) => ({
          id: String(document.id),
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
    .select("id,title,file_url,file_type,language,version")
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
    documentId: String(data.id),
    fileType: data.file_type,
    fileUrl: data.file_url || null,
    language: data.language,
    title: data.title,
    version: data.version ?? ""
  };
}
