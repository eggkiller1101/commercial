import Link from "next/link";

import { PageHero } from "@/components/layout/page-hero";
import { ProductGrid } from "@/components/products/product-grid";
import { getCategoryTree } from "@/features/categories/data";
import { getPublishedProductsPage } from "@/features/products/data";
import { t } from "@/lib/i18n/dictionary";
import { getLocale } from "@/lib/i18n/get-locale";

type ProductsPageProps = {
  searchParams: Promise<{ category?: string; page?: string; q?: string }>;
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const [categoryTree, locale] = await Promise.all([getCategoryTree(), getLocale()]);

  const selectedSlug = params.category;
  let subcategoryId: string | undefined;

  if (selectedSlug) {
    for (const category of categoryTree) {
      const match = category.subcategories.find((sub) => sub.slug === selectedSlug);

      if (match) {
        subcategoryId = match.id;
        break;
      }
    }
  }

  const page = Math.max(1, Number(params.page) || 1);
  const q = params.q?.trim() || "";

  const { pageSize, products, total } = await getPublishedProductsPage({
    page,
    q,
    subcategoryId
  });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function buildHref(next: { category?: string; page?: number }): string {
    const searchParams = new URLSearchParams();
    const merged = {
      category: selectedSlug,
      page,
      ...next
    };

    if (merged.category) {
      searchParams.set("category", merged.category);
    }
    if (q) {
      searchParams.set("q", q);
    }
    if (merged.page && merged.page > 1) {
      searchParams.set("page", String(merged.page));
    }

    const qs = searchParams.toString();
    return `/products${qs ? `?${qs}` : ""}`;
  }

  return (
    <div>
      <PageHero
        description={t(locale, "products.heroDesc")}
        eyebrow={t(locale, "products.heroEyebrow")}
        title={t(locale, "products.heroTitle")}
      />

      <div className="mx-auto grid max-w-site gap-8 px-4 py-10 lg:grid-cols-[240px_1fr]">
        <aside>
          <div className="rounded-lg border border-border bg-card p-4">
            <h4 className="mb-3 text-sm font-semibold">{t(locale, "products.filterCategory")}</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  className={`block rounded-md px-2 py-1.5 text-sm ${
                    !selectedSlug
                      ? "bg-primary-50 font-semibold text-primary-700"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  href={buildHref({ category: undefined, page: 1 })}
                >
                  {t(locale, "products.filterAll")}
                </Link>
              </li>
              {categoryTree.map((category) => (
                <li key={category.id}>
                  <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {category.name}
                  </p>
                  <ul className="mt-1">
                    {category.subcategories.map((sub) => (
                      <li key={sub.id}>
                        <Link
                          className={`block rounded-md px-2 py-1.5 text-sm ${
                            selectedSlug === sub.slug
                              ? "bg-primary-50 font-semibold text-primary-700"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                          href={buildHref({ category: sub.slug, page: 1 })}
                        >
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <section>
          <form action="/products" className="mb-6 flex gap-2" method="GET">
            {selectedSlug ? <input name="category" type="hidden" value={selectedSlug} /> : null}
            <input
              className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm"
              defaultValue={q}
              name="q"
              placeholder={t(locale, "products.searchKeyword")}
              type="search"
            />
            <button
              className="h-10 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary-600"
              type="submit"
            >
              🔍
            </button>
          </form>

          <div className="mb-4 text-sm text-muted-foreground">
            {t(locale, "products.resultCount", { count: total })}
          </div>

          {products.length ? (
            <ProductGrid locale={locale} products={products} />
          ) : (
            <div className="rounded-lg border border-border bg-card p-10 text-center text-sm text-muted-foreground">
              {t(locale, "products.noResults")}
            </div>
          )}

          {totalPages > 1 ? (
            <div className="mt-8 flex items-center justify-center gap-3">
              <Link
                className={`rounded-md border border-border px-4 py-2 text-sm ${
                  page <= 1 ? "pointer-events-none opacity-40" : "hover:border-primary-500"
                }`}
                href={buildHref({ page: Math.max(1, page - 1) })}
              >
                {t(locale, "products.prevPage")}
              </Link>
              <span className="text-sm text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Link
                className={`rounded-md border border-border px-4 py-2 text-sm ${
                  page >= totalPages ? "pointer-events-none opacity-40" : "hover:border-primary-500"
                }`}
                href={buildHref({ page: Math.min(totalPages, page + 1) })}
              >
                {t(locale, "products.nextPage")}
              </Link>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
