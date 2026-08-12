import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ProductFormValues = {
  category: string;
  description: string;
  images: string[];
  productId: string;
  productName: string;
};

export type ProductListItem = {
  id: string;
  name: string;
  uploadedAt: string;
};

export type CreateProductInput = {
  category: string;
  description: string;
  productId: string;
  productName: string;
};

export type CreateProductResult =
  | {
      ok: true;
      productId: string;
    }
  | {
      message: string;
      ok: false;
    };

export type PaginatedProducts = {
  items: ProductListItem[];
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

function mapProductDetail(
  product: {
    id: number;
    model_number: string;
    name: string;
    description: string | null;
    categories?: { name: string } | null;
    product_images?: Array<{ image_url: string }>;
  }
): ProductFormValues {
  return {
    productId: product.model_number,
    productName: product.name,
    description: product.description ?? "",
    category: product.categories?.name ?? "",
    images: product.product_images?.map((image) => image.image_url) ?? []
  };
}

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createProduct(
  input: CreateProductInput
): Promise<CreateProductResult> {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return {
      message: "Supabase 尚未配置，无法写入产品",
      ok: false
    };
  }

  const categoryName = input.category.trim();
  const productModelNumber = input.productId.trim();
  const productName = input.productName.trim();
  const slugBase = createSlug(productModelNumber || productName);
  const slug = slugBase || `product-${Date.now()}`;
  let categoryId: number | null = null;

  if (categoryName) {
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("name", categoryName)
      .maybeSingle();

    if (categoryError) {
      console.error("Failed to load product category", categoryError);
    }

    categoryId = category?.id ?? null;
  }

  const { data, error } = await supabase
    .from("products")
    .insert({
      category_id: categoryId,
      description: input.description.trim(),
      model_number: productModelNumber,
      name: productName,
      slug,
      status: "published",
      published_at: new Date().toISOString()
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create product in Supabase", error);

    return {
      message: error.message,
      ok: false
    };
  }

  return {
    ok: true,
    productId: String(data.id)
  };
}

export async function getProducts(params: {
  page: number;
  pageSize: number;
}): Promise<PaginatedProducts> {
  const supabase = createSupabaseServerClient();

  if (supabase) {
    const requestedPage = Math.max(params.page, 1);
    const from = (requestedPage - 1) * params.pageSize;
    const to = from + params.pageSize - 1;
    const { count, data, error } = await supabase
      .from("products")
      .select("id,name,created_at", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (!error && data) {
      const total = count ?? data.length;
      const totalPages = Math.max(Math.ceil(total / params.pageSize), 1);
      const page = Math.min(requestedPage, totalPages);

      return {
        items: data.map((product) => ({
          id: String(product.id),
          name: product.name,
          uploadedAt: formatDate(product.created_at)
        })),
        page,
        pageSize: params.pageSize,
        total,
        totalPages
      };
    }

    console.error("Failed to load products from Supabase", error);
  }

  return {
    items: [],
    page: 1,
    pageSize: params.pageSize,
    total: 0,
    totalPages: 1
  };
}

export async function getProductById(
  productId: string
): Promise<ProductFormValues | null> {
  const supabase = createSupabaseServerClient();

  if (supabase) {
    const numericId = Number(productId);
    const query = supabase
      .from("products")
      .select(
        "id,model_number,name,description,categories(name),product_images(image_url)"
      );
    const { data, error } = Number.isFinite(numericId)
      ? await query.eq("id", numericId).maybeSingle()
      : await query.eq("model_number", productId).maybeSingle();

    if (!error && data) {
      return mapProductDetail(data);
    }

    if (error) {
      console.error("Failed to load product from Supabase", error);
    }
  }

  return null;
}
