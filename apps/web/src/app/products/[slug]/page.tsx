import { notFound } from "next/navigation";

import { ProductDetailView } from "@/components/products/product-detail-view";
import {
  getPublishedProductBySlug,
  getRelatedProducts
} from "@/features/products/data";
import { getRequestLocale } from "@/lib/i18n/server";

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductDetailPage({
  params
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getPublishedProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [relatedProducts, locale] = await Promise.all([
    getRelatedProducts(product),
    getRequestLocale()
  ]);

  return (
    <ProductDetailView
      locale={locale}
      product={product}
      relatedProducts={relatedProducts}
    />
  );
}
