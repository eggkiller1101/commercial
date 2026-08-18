import { createSupabaseAdminClient } from "@/lib/supabase/server";

export type ProductFormValues = {
  databaseId?: string;
  description: string;
  images: string[];
  isFeatured: boolean;
  primaryCategoryId: string;
  productModel: string;
  productName: string;
  sku: string;
  subcategoryId: string;
  summary: string;
  applicationNotes: string;
};

export type ProductCategoryOption = {
  id: string;
  name: string;
};

export type ProductSubcategoryOption = {
  categoryId: string;
  id: string;
  name: string;
};

export type ProductFormOptions = {
  categories: ProductCategoryOption[];
  subcategories: ProductSubcategoryOption[];
};

export type ProductListItem = {
  id: string;
  name: string;
  status: string;
  uploadedAt: string;
};

export type CreateProductInput = {
  description: string;
  isFeatured: boolean;
  primaryCategoryId: string;
  productModel: string;
  productName: string;
  sku: string;
  subcategoryId: string;
  summary: string;
  applicationNotes: string;
};

export type UpdateProductInput = CreateProductInput & {
  databaseId: string;
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

export type UpdateProductStatusResult =
  | {
      ok: true;
    }
  | {
      message: string;
      ok: false;
    };

export type UpdateProductResult = CreateProductResult;

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

const productFormOptionsTimeoutMs = 5000;

function formatDate(value: string | null) {
  if (!value) {
    return "";
  }

  return formatter.format(new Date(value));
}

function mapProductDetail(
  product: {
    application_notes: string | null;
    id: number;
    is_featured: boolean;
    model_number: string;
    name: string;
    description: string | null;
    subcategory_id: number | null;
    summary: string | null;
    product_images?: Array<{ image_url: string }>;
  },
  sku: string,
  primaryCategoryId: string
): ProductFormValues {
  return {
    applicationNotes: product.application_notes ?? "",
    databaseId: String(product.id),
    description: product.description ?? "",
    images: product.product_images?.map((image) => image.image_url) ?? [],
    isFeatured: product.is_featured,
    primaryCategoryId,
    productModel: product.model_number,
    productName: product.name,
    sku,
    subcategoryId: product.subcategory_id ? String(product.subcategory_id) : "",
    summary: product.summary ?? ""
  };
}

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function getProductFormOptions(): Promise<ProductFormOptions> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      categories: [],
      subcategories: []
    };
  }

  const emptyOptions = {
    categories: [],
    subcategories: []
  };

  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<ProductFormOptions>((resolve) => {
    timeoutId = setTimeout(() => {
      console.error("Product category options request timed out");
      resolve(emptyOptions);
    }, productFormOptionsTimeoutMs);
  });

  const optionsRequest = (async () => {
    const [categoriesResult, subcategoriesResult] = await Promise.all([
      supabase
        .from("categories")
        .select("id,name")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),
      supabase
        .from("subcategories")
        .select("id,category_id,name")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true })
    ]);

    if (categoriesResult.error) {
      console.error(
        "Failed to load product categories",
        categoriesResult.error
      );
    }

    if (subcategoriesResult.error) {
      console.error(
        "Failed to load product subcategories",
        subcategoriesResult.error
      );
    }

    return {
      categories:
        categoriesResult.data?.map((category) => ({
          id: String(category.id),
          name: category.name
        })) ?? [],
      subcategories:
        subcategoriesResult.data?.map((subcategory) => ({
          categoryId: String(subcategory.category_id),
          id: String(subcategory.id),
          name: subcategory.name
        })) ?? []
    };
  })();

  try {
    return await Promise.race([optionsRequest, timeout]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

async function saveProductSku(params: {
  productId: number;
  productName: string;
  sku: string;
}) {
  const supabase = createSupabaseAdminClient();

  if (!supabase || !params.sku.trim()) {
    return;
  }

  const { data: variant, error: loadError } = await supabase
    .from("product_variants")
    .select("id")
    .eq("product_id", params.productId)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (loadError) {
    console.error("Failed to load product variant", loadError);
  }

  if (variant?.id) {
    const { error } = await supabase
      .from("product_variants")
      .update({
        is_active: true,
        sku: params.sku.trim(),
        variant_name: params.productName.trim()
      })
      .eq("id", variant.id);

    if (error) {
      console.error("Failed to update product sku", error);
      throw new Error(error.message);
    }

    return;
  }

  const { error } = await supabase.from("product_variants").insert({
    is_active: true,
    product_id: params.productId,
    sku: params.sku.trim(),
    sort_order: 0,
    variant_name: params.productName.trim()
  });

  if (error) {
    console.error("Failed to create product sku", error);
    throw new Error(error.message);
  }
}

export async function createProduct(
  input: CreateProductInput
): Promise<CreateProductResult> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      message: "Supabase service role 尚未配置，无法写入产品",
      ok: false
    };
  }

  const subcategoryId = Number(input.subcategoryId);
  const productModelNumber = input.productModel.trim();
  const productName = input.productName.trim();
  const slugBase = createSlug(productModelNumber || productName);
  const slug = slugBase || `product-${Date.now()}`;

  const { data, error } = await supabase
    .from("products")
    .insert({
      application_notes: input.applicationNotes.trim() || null,
      description: input.description.trim(),
      is_featured: input.isFeatured,
      model_number: productModelNumber,
      name: productName,
      slug,
      subcategory_id: Number.isFinite(subcategoryId) ? subcategoryId : null,
      summary: input.summary.trim(),
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

  try {
    await saveProductSku({
      productId: data.id,
      productName,
      sku: input.sku
    });
  } catch (skuError) {
    return {
      message:
        skuError instanceof Error ? skuError.message : "产品 SKU 保存失败",
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
  const supabase = createSupabaseAdminClient();

  if (supabase) {
    const requestedPage = Math.max(params.page, 1);
    const from = (requestedPage - 1) * params.pageSize;
    const to = from + params.pageSize - 1;
    const { count, data, error } = await supabase
      .from("products")
      .select("id,name,status,created_at", { count: "exact" })
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
          status: product.status,
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

export async function updateProduct(
  input: UpdateProductInput
): Promise<UpdateProductResult> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      message: "Supabase service role 尚未配置，无法更新产品",
      ok: false
    };
  }

  const numericId = Number(input.databaseId);

  if (!Number.isFinite(numericId)) {
    return {
      message: "产品 id 无效",
      ok: false
    };
  }

  const subcategoryId = Number(input.subcategoryId);
  const productModelNumber = input.productModel.trim();
  const productName = input.productName.trim();
  const slugBase = createSlug(productModelNumber || productName);
  const slug = slugBase || `product-${numericId}`;

  const { error } = await supabase
    .from("products")
    .update({
      application_notes: input.applicationNotes.trim() || null,
      description: input.description.trim(),
      is_featured: input.isFeatured,
      model_number: productModelNumber,
      name: productName,
      slug,
      subcategory_id: Number.isFinite(subcategoryId) ? subcategoryId : null,
      summary: input.summary.trim(),
      status: "published",
      published_at: new Date().toISOString()
    })
    .eq("id", numericId);

  if (error) {
    console.error("Failed to update product in Supabase", error);

    return {
      message: error.message,
      ok: false
    };
  }

  try {
    await saveProductSku({
      productId: numericId,
      productName,
      sku: input.sku
    });
  } catch (skuError) {
    return {
      message:
        skuError instanceof Error ? skuError.message : "产品 SKU 保存失败",
      ok: false
    };
  }

  return {
    ok: true,
    productId: String(numericId)
  };
}

export async function updateProductStatus(params: {
  productId: string;
  status: "published" | "unpublished";
}): Promise<UpdateProductStatusResult> {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return {
      message: "Supabase service role 尚未配置，无法更新产品状态",
      ok: false
    };
  }

  const numericId = Number(params.productId);

  if (!Number.isFinite(numericId)) {
    return {
      message: "产品 id 无效",
      ok: false
    };
  }

  const { error } = await supabase
    .from("products")
    .update({ status: params.status })
    .eq("id", numericId);

  if (error) {
    console.error("Failed to update product status in Supabase", error);

    return {
      message: error.message,
      ok: false
    };
  }

  return {
    ok: true
  };
}

export async function getProductById(
  productId: string
): Promise<ProductFormValues | null> {
  const supabase = createSupabaseAdminClient();

  if (supabase) {
    const numericId = Number(productId);
    const query = supabase
      .from("products")
      .select(
        "id,subcategory_id,model_number,name,summary,description,application_notes,is_featured,product_images(image_url)"
      );
    const { data, error } = Number.isFinite(numericId)
      ? await query.eq("id", numericId).maybeSingle()
      : await query.eq("model_number", productId).maybeSingle();

    if (!error && data) {
      const { data: variant, error: variantError } = await supabase
        .from("product_variants")
        .select("sku")
        .eq("product_id", data.id)
        .order("sort_order", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (variantError) {
        console.error("Failed to load product sku", variantError);
      }

      let primaryCategoryId = "";

      if (data.subcategory_id) {
        const { data: subcategory, error: subcategoryError } = await supabase
          .from("subcategories")
          .select("category_id")
          .eq("id", data.subcategory_id)
          .maybeSingle();

        if (subcategoryError) {
          console.error(
            "Failed to load product subcategory",
            subcategoryError
          );
        }

        primaryCategoryId = subcategory?.category_id
          ? String(subcategory.category_id)
          : "";
      }

      return mapProductDetail(data, variant?.sku ?? "", primaryCategoryId);
    }

    if (error) {
      console.error("Failed to load product from Supabase", error);
    }
  }

  return null;
}
