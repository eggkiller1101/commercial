import { notFound } from "next/navigation";

import { getCategoryBySlug } from "@/features/categories/data";

type CategoryPageProps = {
  params: Promise<{
    categorySlug: string;
  }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-semibold">{category.name}</h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        {category.description || "暂无分类描述"}
      </p>
    </div>
  );
}
