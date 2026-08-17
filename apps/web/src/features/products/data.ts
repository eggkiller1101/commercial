import { createSupabaseServerClient } from "@/lib/supabase/server";

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

const productSelect = `
  id,
  model_number,
  name,
  slug,
  summary,
  description,
  application_notes,
  is_featured,
  subcategory_id,
  subcategories (
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
    .select(productSelect)
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

export async function getPublishedProductBySlug(
  slug: string
): Promise<ProductDetail | null> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .or(`slug.eq.${slug},id.eq.${Number(slug) || -1}`)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error("Failed to load published product", error);
    }

    return null;
  }

  return mapProduct(data as unknown as ProductRow);
}

export async function getFeaturedProducts(): Promise<ProductCardItem[]> {
  const products = await getPublishedProducts();

  const featured = products.filter((product) => product.isFeatured);
  return (featured.length ? featured : products).slice(0, 6);
}

export async function getFilterableAttributeDefinitions(): Promise<
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

export async function getRelatedProducts(
  product: ProductDetail,
  limit = 4
): Promise<ProductCardItem[]> {
  const products = await getPublishedProducts({
    categorySlug: product.subcategorySlug || product.categorySlug
  });

  return products.filter((item) => item.id !== product.id).slice(0, limit);
}
