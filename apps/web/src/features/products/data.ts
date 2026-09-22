import { createSupabaseServerClient } from "@/lib/supabase/server";
import { unstable_cache } from "next/cache";

export type ProductCardItem = {
  attributes: ProductAttributeValue[];
  categoryName: string;
  categorySlug: string;
  id: string;
  imageUrl: string | null;
  isFeatured: boolean;
  modelNumber: string;
  name: string;
  slug: string;
  summary: string;
  subcategoryId: string;
  subcategoryName: string;
  subcategorySlug: string;
};

export type ProductDetail = ProductCardItem & {
  applicationNotes: string;
  description: string;
  documents: ProductDocument[];
  images: string[];
  variants: ProductVariant[];
};

export type ProductAttributeDefinition = {
  categoryId: string;
  code: string;
  dataType: "text" | "number" | "enum";
  id: string;
  isFilterable: boolean;
  name: string;
  sortOrder: number;
  unit: string;
};

export type ProductAttributeValue = {
  definitionId: string;
  valueNumber: number | null;
  valueText: string | null;
};

export type ProductListQuery = {
  attributes?: Record<string, string[] | { max?: string; min?: string }>;
  categorySlug?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
  sort?: "newest" | "name_asc" | "model_asc";
};

export type ProductListResult = {
  items: ProductCardItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type ProductVariant = {
  name: string;
  sku: string;
};

export type ProductDocument = {
  fileType: string;
  fileUrl: string;
  title: string;
};

type ProductRow = {
  id: number;
  application_notes?: string | null;
  description?: string | null;
  is_featured?: boolean | null;
  model_number: string;
  name: string;
  slug: string;
  summary: string | null;
  subcategory_id?: number | null;
  subcategories?: {
    name: string;
    slug: string | null;
    categories?: { name: string; slug: string } | null;
  } | null;
  product_images?: Array<{ image_url: string; is_primary?: boolean | null }>;
  product_attribute_values?: Array<{
    attribute_definition_id: number;
    value_number: number | null;
    value_text: string | null;
  }>;
  product_variants?: Array<{
    is_active?: boolean | null;
    sku: string;
    variant_name: string;
  }>;
  product_documents?: Array<{
    documents?: {
      file_type: string;
      file_url: string;
      published_at: string | null;
      title: string;
    } | null;
  }>;
};

function sortImages(
  images: Array<{ image_url: string; is_primary?: boolean | null }> = []
) {
  return [...images].sort((a, b) => Number(Boolean(b.is_primary)) - Number(Boolean(a.is_primary)));
}

function mapProduct(product: ProductRow): ProductDetail {
  const sortedImages = sortImages(product.product_images);
  const images = product.product_images?.map((image) => image.image_url) ?? [];
  const subcategory = product.subcategories;
  const subcategoryId = product.subcategory_id ? String(product.subcategory_id) : "";
  const category = subcategory?.categories;

  return {
    applicationNotes: product.application_notes ?? "",
    attributes:
      product.product_attribute_values?.map((value) => ({
        definitionId: String(value.attribute_definition_id),
        valueNumber: value.value_number,
        valueText: value.value_text
      })) ?? [],
    categoryName: category?.name ?? "",
    categorySlug: category?.slug ?? "",
    description: product.description ?? "",
    documents:
      product.product_documents
        ?.map((item) => item.documents)
        .filter((document): document is NonNullable<typeof document> =>
          Boolean(document?.published_at)
        )
        .map((document) => ({
          fileType: document.file_type,
          fileUrl: document.file_url,
          title: document.title
        })) ?? [],
    id: String(product.id),
    imageUrl: sortedImages[0]?.image_url ?? null,
    images,
    isFeatured: Boolean(product.is_featured),
    modelNumber: product.model_number,
    name: product.name,
    slug: product.slug,
    subcategoryId,
    subcategoryName: subcategory?.name ?? "",
    subcategorySlug: subcategory?.slug ?? subcategoryId,
    summary: product.summary ?? "",
    variants:
      product.product_variants
        ?.filter((variant) => variant.is_active !== false)
        .map((variant) => ({
          name: variant.variant_name,
          sku: variant.sku
        })) ?? []
  };
}

const productListSelect = `
  id,
  model_number,
  name,
  slug,
  summary,
  is_featured,
  subcategory_id,
  subcategories!products_subcategory_id_fkey (
    name,
    slug,
    categories ( name, slug )
  ),
  product_images ( image_url, is_primary ),
  product_attribute_values ( attribute_definition_id, value_text, value_number )
`;

const productDetailSelect = `
  id,
  model_number,
  name,
  slug,
  summary,
  description,
  application_notes,
  is_featured,
  subcategory_id,
  subcategories!products_subcategory_id_fkey (
    name,
    slug,
    categories ( name, slug )
  ),
  product_images ( image_url, is_primary ),
  product_attribute_values ( attribute_definition_id, value_text, value_number ),
  product_variants ( sku, variant_name, is_active ),
  product_documents (
    documents ( title, file_url, file_type, published_at )
  )
`;

export async function getPublishedProducts(params: {
  categorySlug?: string;
  keyword?: string;
} = {}): Promise<ProductCardItem[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  let query = supabase
    .from("products")
    .select(productListSelect)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (params.keyword?.trim()) {
    const keyword = params.keyword.trim();
    query = query.or(`name.ilike.%${keyword}%,model_number.ilike.%${keyword}%`);
  }

  const { data, error } = await query;

  if (error || !data) {
    console.error("Failed to load published products", error);
    return [];
  }

  let products = (data as unknown as ProductRow[]).map(mapProduct);

  if (params.categorySlug) {
    products = products.filter(
      (product) =>
        product.categorySlug === params.categorySlug ||
        product.subcategorySlug === params.categorySlug ||
        product.subcategoryId === params.categorySlug
    );
  }

  return products;
}

async function loadPublishedProductPage(
  query: ProductListQuery = {}
): Promise<ProductListResult> {
  const pageSize = Math.max(1, query.pageSize ?? 24);
  const page = Math.max(1, query.page ?? 1);
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return { items: [], page, pageSize, total: 0, totalPages: 1 };
  }

  let matchingIds: number[] | null = null;
  const intersectIds = (nextIds: number[]) => {
    matchingIds = matchingIds === null
      ? nextIds
      : matchingIds.filter((id) => nextIds.includes(id));
  };

  if (query.categorySlug) {
    const [{ data: category }, { data: subcategory }] = await Promise.all([
      supabase.from("categories").select("id").eq("slug", query.categorySlug).maybeSingle(),
      supabase.from("subcategories").select("id,category_id").eq("slug", query.categorySlug).maybeSingle()
    ]);

    if (subcategory?.id) {
      const { data } = await supabase
        .from("products")
        .select("id")
        .eq("status", "published")
        .eq("subcategory_id", subcategory.id);
      intersectIds((data ?? []).map((item) => item.id));
    } else if (category?.id) {
      const { data: children } = await supabase
        .from("subcategories")
        .select("id")
        .eq("category_id", category.id);
      const childIds = (children ?? []).map((item) => item.id);
      if (!childIds.length) {
        return { items: [], page, pageSize, total: 0, totalPages: 1 };
      }
      const { data } = await supabase
        .from("products")
        .select("id")
        .eq("status", "published")
        .in("subcategory_id", childIds);
      intersectIds((data ?? []).map((item) => item.id));
    } else {
      return { items: [], page, pageSize, total: 0, totalPages: 1 };
    }
  }

  const keyword = query.keyword?.trim();
  if (keyword) {
    const [byName, byModel] = await Promise.all([
      supabase.from("products").select("id").eq("status", "published").ilike("name", `%${keyword}%`),
      supabase.from("products").select("id").eq("status", "published").ilike("model_number", `%${keyword}%`)
    ]);
    intersectIds([
      ...(byName.data ?? []).map((item) => item.id),
      ...(byModel.data ?? []).map((item) => item.id)
    ]);
  }

  for (const [code, value] of Object.entries(query.attributes ?? {})) {
    const { data: definition } = await supabase
      .from("attribute_definitions")
      .select("id,data_type")
      .eq("code", code)
      .maybeSingle();
    if (!definition) continue;

    let attributeQuery = supabase
      .from("product_attribute_values")
      .select("product_id")
      .eq("attribute_definition_id", definition.id);

    if (definition.data_type === "number" && !Array.isArray(value)) {
      if (value.min) attributeQuery = attributeQuery.gte("value_number", Number(value.min));
      if (value.max) attributeQuery = attributeQuery.lte("value_number", Number(value.max));
    } else if (Array.isArray(value) && value.length) {
      attributeQuery = attributeQuery.in("value_text", value);
    }

    const { data } = await attributeQuery;
    intersectIds((data ?? []).map((item) => item.product_id));
  }

  const resolvedMatchingIds = matchingIds as number[] | null;
  if (resolvedMatchingIds !== null && resolvedMatchingIds.length === 0) {
    return { items: [], page, pageSize, total: 0, totalPages: 1 };
  }

  let countQuery = supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("status", "published");
  let listQuery = supabase
    .from("products")
    .select(productListSelect)
    .eq("status", "published");

  if (matchingIds) {
    countQuery = countQuery.in("id", matchingIds);
    listQuery = listQuery.in("id", matchingIds);
  }

  const [{ count, error: countError }, { data, error }] = await Promise.all([
    countQuery,
    listQuery
      .order(query.sort === "name_asc" ? "name" : query.sort === "model_asc" ? "model_number" : "published_at", { ascending: query.sort !== "newest" })
      .order("created_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1)
  ]);

  if (countError || error) {
    console.error("Failed to load published product page", countError ?? error);
    return { items: [], page, pageSize, total: 0, totalPages: 1 };
  }

  const total = count ?? 0;
  return {
    items: ((data ?? []) as unknown as ProductRow[]).map(mapProduct),
    page,
    pageSize,
    total,
    totalPages: Math.max(Math.ceil(total / pageSize), 1)
  };
}

const getCachedPublishedProductPage = unstable_cache(
  loadPublishedProductPage,
  ["published-product-page"],
  { revalidate: 30, tags: ["products"] }
);

export async function getPublishedProductPage(
  query: ProductListQuery = {}
): Promise<ProductListResult> {
  return getCachedPublishedProductPage(query);
}

async function loadPublishedProductBySlug(
  slug: string
): Promise<ProductDetail | null> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const isNumericId = /^\d+$/.test(slug);
  const detailQuery = supabase
    .from("products")
    .select(productDetailSelect)
    .eq("status", "published");
  const { data, error } = isNumericId
    ? await detailQuery.eq("id", Number(slug)).maybeSingle()
    : await detailQuery.eq("slug", slug).maybeSingle();

  if (error || !data) {
    if (error) {
      console.error("Failed to load published product", error);
    }

    return null;
  }

  return mapProduct(data as unknown as ProductRow);
}

const getCachedPublishedProductBySlug = unstable_cache(
  loadPublishedProductBySlug,
  ["published-product-detail"],
  { revalidate: 30, tags: ["products"] }
);

export async function getPublishedProductBySlug(
  slug: string
): Promise<ProductDetail | null> {
  return getCachedPublishedProductBySlug(slug);
}

export async function getFeaturedProducts(): Promise<ProductCardItem[]> {
  const products = await getPublishedProducts();

  const featured = products.filter((product) => product.isFeatured);
  return (featured.length ? featured : products).slice(0, 6);
}

async function loadFilterableAttributeDefinitions(): Promise<
  ProductAttributeDefinition[]
> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("attribute_definitions")
    .select("id,category_id,code,name,unit,data_type,is_filterable,sort_order")
    .eq("is_filterable", true)
    .order("sort_order", { ascending: true });

  if (error || !data) {
    console.error("Failed to load filterable attribute definitions", error);
    return [];
  }

  return data.map((definition) => ({
    categoryId:
      definition.category_id === null || definition.category_id === undefined
        ? ""
        : String(definition.category_id),
    code: definition.code,
    dataType: definition.data_type,
    id: String(definition.id),
    isFilterable: definition.is_filterable,
    name: definition.name,
    sortOrder: definition.sort_order,
    unit: definition.unit ?? ""
  }));
}

const getCachedFilterableAttributeDefinitions = unstable_cache(
  loadFilterableAttributeDefinitions,
  ["filterable-attribute-definitions"],
  { revalidate: 60, tags: ["attribute-definitions"] }
);

export async function getFilterableAttributeDefinitions(): Promise<
  ProductAttributeDefinition[]
> {
  return getCachedFilterableAttributeDefinitions();
}

async function loadRelatedProducts(
  productId: string,
  subcategoryId: string,
  limit: number
): Promise<ProductCardItem[]> {
  const supabase = createSupabaseServerClient();
  const numericSubcategoryId = Number(subcategoryId);

  if (!supabase || !Number.isInteger(numericSubcategoryId)) {
    return [];
  }

  const { data, error } = await supabase
    .from("products")
    .select(`
      id, model_number, name, slug, summary, is_featured, subcategory_id,
      subcategories!products_subcategory_id_fkey (
        name, slug, categories ( name, slug )
      ),
      product_images ( image_url, is_primary )
    `)
    .eq("status", "published")
    .eq("subcategory_id", numericSubcategoryId)
    .neq("id", Number(productId))
    .order("published_at", { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 4));

  if (error || !data) {
    console.error("Failed to load related products", error);
    return [];
  }

  return (data as unknown as ProductRow[]).map(mapProduct);
}

const getCachedRelatedProducts = unstable_cache(
  loadRelatedProducts,
  ["related-products"],
  { revalidate: 30, tags: ["products"] }
);

export async function getRelatedProducts(
  product: ProductDetail,
  limit = 4
): Promise<ProductCardItem[]> {
  return getCachedRelatedProducts(
    product.id,
    product.subcategoryId,
    Math.min(Math.max(limit, 1), 4)
  );
}
