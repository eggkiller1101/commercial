import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumb } from "@/components/layout/breadcrumb";
import { PageHero } from "@/components/layout/page-hero";
import { ProductGrid } from "@/components/products/product-grid";
import { getCategoryPageBySlug } from "@/features/categories/data";
import { getProductsBySubcategoryId } from "@/features/products/data";
import { t } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/get-locale";

type CategoryPageProps = {
  params: Promise<{
    categorySlug: string;
  }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categorySlug } = await params;
  const [page, locale] = await Promise.all([
    getCategoryPageBySlug(categorySlug),
    getLocale()
  ]);

  if (!page) {
    notFound();
  }

  if (page.kind === "category") {
    const { category, subcategories } = page;

    return (
      <div>
        <Breadcrumb
          items={[
            { href: "/products", label: t(locale, "nav.products") },
            { href: `/categories/${category.slug}`, label: category.name }
          ]}
          locale={locale}
        />

        <PageHero
          description={category.description || undefined}
          eyebrow={t(locale, "products.filterCategory")}
          title={category.name}
        />

        <div className="mx-auto max-w-site px-4 py-10">
          {subcategories.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {subcategories.map((subcategory) => (
                <Link
                  className="block rounded-lg border border-border bg-card p-6 transition-shadow hover:shadow-md"
                  href={`/categories/${subcategory.slug}`}
                  key={subcategory.id}
                >
                  <h3 className="font-semibold text-foreground">{subcategory.name}</h3>
                  <p className="mt-2 line-clamp-2 text-[13px] text-muted-foreground">
                    {subcategory.description}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t(locale, "products.noPublished")}</p>
          )}
        </div>
      </div>
    );
  }

  const { parentCategory, subcategory } = page;
  const products = await getProductsBySubcategoryId(subcategory.id);

  return (
    <div>
      <Breadcrumb
        items={[
          { href: "/products", label: t(locale, "nav.products") },
          ...(parentCategory
            ? [{ href: `/categories/${parentCategory.slug}`, label: parentCategory.name }]
            : []),
          { href: `/categories/${subcategory.slug}`, label: subcategory.name }
        ]}
        locale={locale}
      />

      <PageHero
        description={subcategory.description || undefined}
        eyebrow={t(locale, "products.filterCategory")}
        title={subcategory.name}
      >
        {parentCategory ? (
          <Link
            className="mt-4 inline-block text-sm text-neutral-300 hover:text-neutral-0"
            href={`/categories/${parentCategory.slug}`}
          >
            ← {parentCategory.name}
          </Link>
        ) : null}
      </PageHero>

      <div className="mx-auto max-w-site px-4 py-10">
        <div className="mb-6 text-sm text-muted-foreground">
          {t(locale, "products.resultCount", { count: products.length })}
        </div>
        <ProductGrid locale={locale} products={products} />
      </div>
    </div>
  );
}
