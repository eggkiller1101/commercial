import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DocumentItem = {
  categoryName: string;
  fileSizeBytes: number | null;
  fileType: string;
  fileUrl: string;
  id: string;
  language: string;
  productId: string | null;
  productName: string;
  title: string;
  version: string;
};

type DocumentRow = {
  id: number;
  title: string;
  file_type: string;
  file_url: string;
  file_size_bytes: number | null;
  language: string;
  version: string | null;
};

type DocumentRowWithProduct = DocumentRow & {
  product_documents?: Array<{
    products?: {
      id: number;
      name: string;
      subcategories?: { name: string; categories?: { name: string } | null } | null;
    } | null;
  }>;
};

function mapBaseDocument(document: DocumentRow): DocumentItem {
  return {
    categoryName: "",
    fileSizeBytes: document.file_size_bytes,
    fileType: document.file_type,
    fileUrl: document.file_url,
    id: String(document.id),
    language: document.language,
    productId: null,
    productName: "",
    title: document.title,
    version: document.version ?? ""
  };
}

function mapDocumentWithProduct(document: DocumentRowWithProduct): DocumentItem {
  const linkedProduct = document.product_documents?.[0]?.products ?? null;
  const categoryName =
    linkedProduct?.subcategories?.categories?.name ?? linkedProduct?.subcategories?.name ?? "";

  return {
    ...mapBaseDocument(document),
    categoryName,
    productId: linkedProduct ? String(linkedProduct.id) : null,
    productName: linkedProduct?.name ?? ""
  };
}

/**
 * 资料中心：每份技术文档展示所属产品/分类信息（跟 demo 静态站的资料列表一致），
 * 通过 product_documents 多对多关联表拿到"挂载这份资料的产品"（一份资料可能
 * 挂在多个产品上，这里只展示第一个用于"查看产品"跳转链接和分类说明文字）。
 *
 * product_documents 这张关联表是否已经在真实 Supabase 项目里建好还不确定
 * （schema.sql 里有设计，但当前 database.types.ts 手工维护的类型定义里没有它），
 * 所以这里先尝试带关联的查询，如果报"找不到关系"之类的错误，就自动降级成
 * 不带产品信息的纯文档列表，保证资料中心至少能正常显示文件本身。
 */
export async function getPublishedDocuments(): Promise<DocumentItem[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  // product_documents 这张关联表不在 database.types.ts 的 Relationships 里
  // （因为不确定真实库里是否已建好），Supabase 的类型化查询构造器没法推断这个
  // 内嵌查询的返回类型，会直接把结果类型收窄成 never。这里用 `as any` 绕过，
  // 后面 mapDocumentWithProduct 会显式转换回 DocumentRowWithProduct 再读取字段。
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- 见上方注释
  const { data, error } = (await (supabase as any)
    .from("documents")
    .select(
      "id,title,file_type,file_url,file_size_bytes,language,version,published_at,product_documents(products(id,name,subcategories(name,categories(name))))"
    )
    .not("published_at", "is", null)
    .order("published_at", { ascending: false })) as {
    data: DocumentRowWithProduct[] | null;
    error: { message: string } | null;
  };

  if (!error && data) {
    return data.map((row) => mapDocumentWithProduct(row));
  }

  console.error(
    "Failed to load documents with product_documents join, falling back to plain document list",
    error
  );

  const fallback = await supabase
    .from("documents")
    .select("id,title,file_type,file_url,file_size_bytes,language,version,published_at")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false });

  if (fallback.error || !fallback.data) {
    console.error("Failed to load published documents", fallback.error);
    return [];
  }

  return fallback.data.map((row) => mapBaseDocument(row as unknown as DocumentRow));
}
