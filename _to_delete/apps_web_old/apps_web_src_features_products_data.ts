import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ProductCardItem = {
  id: string;
  imageUrl: string | null;
  modelNumber: string;
  name: string;
  summary: string;
};

export type ProductDetail = ProductCardItem & {
  categoryName: string;
  description: string;
  images: string[];
};

function mapProduct(product: {
  id: number;
  model_number: string;
  name: string;
  summary: string | null;
  description?: string | null;
  categories?: { name: string } | null;
  product_images?: Array<{ image_url: string; is_primary?: boolean | null }>;
}): ProductDetail {
  const images = product.product_images?.map((image) => image.image_url) ?? [];

  return {
    categoryName: product.categories?.name ?? "",
    description: product.description ?? "",
    id: String(product.id),
    imageUrl: images[0] ?? null,
    images,
    modelNumber: product.model_number,
    name: product.name,
    summary: product.summary ?? ""
  };
}

export async function getPublishedProducts(): Promise<ProductCardItem[]> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("products")
    .select("id,model_number,name,summary,product_images(image_url,is_primary)")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error || !data) {
    console.error("Failed to load published products", error);
    return [];
  }

  return data.map(mapProduct);
}

export async function getPublishedProductById(
  productId: string
): Promise<ProductDetail | null> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const numericId = Number(productId);

  if (!Number.isFinite(numericId)) {
    return null;
  }

  const { data, error } = await supabase
    .from("products")
    .select(
      "id,model_number,name,summary,description,categories(name),product_images(image_url,is_primary)"
    )
    .eq("id", numericId)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) {
    if (error) {
      console.error("Failed to load published product", error);
    }

    return null;
  }

  return mapProduct(data);
}

export async function getFeaturedProducts(): Promise<ProductCardItem[]> {
  const products = await getPublishedProducts();

  return products.slice(0, 6);
}
