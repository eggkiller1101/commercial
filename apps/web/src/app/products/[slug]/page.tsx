import { notFound } from "next/navigation";

import { ProductDetailView } from "@/components/products/product-detail-view";
import {
  getPublishedProductBySlug,
  getRelatedProducts
} from "@/features/products/data";

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

  const relatedProducts = await getRelatedProducts(product);

  return <ProductDetailView product={product} relatedProducts={relatedProducts} />;
}
