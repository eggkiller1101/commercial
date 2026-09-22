"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { CategoryItem } from "@/features/categories/data";
import type {
  ProductAttributeDefinition,
  ProductCardItem
} from "@/features/products/data";
import {
  defaultLocale,
  getDictionary,
  type Locale
} from "@/lib/i18n/dictionaries";


type CatalogState = {
  attrFilters: Record<string, string[] | { max?: string; min?: string }>;
  categorySlug: string;
  keyword: string;
  page: number;
  sort: "newest" | "name_asc" | "model_asc";
};

function getInitialState(query: string): CatalogState {
  const params = new URLSearchParams(query);
  const sort = params.get("sort");
  const attrFilters: CatalogState["attrFilters"] = {};

  params.forEach((value, key) => {
    if (!key.startsWith("attr_")) {
      return;
    }

    try {
      attrFilters[key.replace("attr_", "")] = JSON.parse(value) as
        | string[]
        | { max?: string; min?: string };
    } catch {
      attrFilters[key.replace("attr_", "")] = [value];
    }
  });

  return {
    attrFilters,
    categorySlug: params.get("category") ?? "",
    keyword: params.get("q") ?? "",
    page: Number(params.get("page")) || 1,
    sort:
      sort === "name_asc" || sort === "model_asc" || sort === "newest"
        ? sort
        : "newest"
  };
}

function writeStateToUrl(state: CatalogState) {
  const params = new URLSearchParams();

  if (state.categorySlug) {
    params.set("category", state.categorySlug);
  }

  if (state.keyword.trim()) {
    params.set("q", state.keyword.trim());
  }

  if (state.sort !== "newest") {
    params.set("sort", state.sort);
  }

  if (state.page !== 1) {
    params.set("page", String(state.page));
  }

  Object.entries(state.attrFilters).forEach(([code, value]) => {
    const isEmpty =
      value === undefined ||
      value === null ||
      (Array.isArray(value) && value.length === 0) ||
      (!Array.isArray(value) && !value.min && !value.max);

    if (!isEmpty) {
      params.set(`attr_${code}`, JSON.stringify(value));
    }
  });

  const query = params.toString();
  window.history.replaceState(null, "", query ? `/products?${query}` : "/products");
}

function addToCart(product: ProductCardItem) {
  const storageKey = "cloudintel_quote_cart_v1";
  const raw = window.localStorage.getItem(storageKey);
  const current = raw
    ? (JSON.parse(raw) as Array<{
        id: string;
        modelNumber: string;
        name: string;
        quantity: number;
      }>)
    : [];
  const existing = current.find((item) => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    current.push({
      id: product.id,
      modelNumber: product.modelNumber,
      name: product.name,
      quantity: 1
    });
  }

  window.localStorage.setItem(storageKey, JSON.stringify(current));
}

function countProducts(products: ProductCardItem[], slug: string) {
  return products.filter(
    (product) =>
      product.categorySlug === slug ||
      product.subcategorySlug === slug ||
      product.subcategoryId === slug
  ).length;
}

export function ProductsCatalog({
  attributeDefinitions,
  categories,
  initialQuery = "",
  locale = defaultLocale,
  products,
  totalPages,
  totalProducts
}: {
  attributeDefinitions: ProductAttributeDefinition[];
  categories: CategoryItem[];
  initialQuery?: string;
  locale?: Locale;
  products: ProductCardItem[];
  totalPages: number;
  totalProducts: number;
}) {
  const router = useRouter();
  const dictionary = getDictionary(locale);
  const t = dictionary.products;
  const common = dictionary.common;
  const categoryName = (category: { name: string; nameEn?: string }) =>
    locale === "en" && category.nameEn ? category.nameEn : category.name;
  const [state, setState] = useState<CatalogState>(() => getInitialState(initialQuery));
  const [keywordInput, setKeywordInput] = useState(() => getInitialState(initialQuery).keyword);
  const [jumpPage, setJumpPage] = useState("");
  const activeCategory = useMemo(() => {
    for (const category of categories) {
      if (category.slug === state.categorySlug) {
        return category;
      }

      const subcategory = category.subcategories?.find(
        (item) => item.slug === state.categorySlug
      );

      if (subcategory) {
        return subcategory;
      }
    }

    return null;
  }, [categories, state.categorySlug]);

  const filteredProducts = products;

  const activeCategoryIds = useMemo(() => {
    if (!activeCategory) {
      return [];
    }

    const topCategory = categories.find(
      (category) => category.slug === activeCategory.slug
    );

    if (topCategory) {
      return (topCategory.subcategories ?? []).map((item) => item.id);
    }

    return [activeCategory.id];
  }, [activeCategory, categories]);

  const activeAttributeDefinitions = useMemo(
    () =>
      activeCategoryIds.length
        ? attributeDefinitions.filter((definition) =>
            activeCategoryIds.includes(definition.categoryId)
          )
        : [],
    [activeCategoryIds, attributeDefinitions]
  );

  const safePage = Math.max(1, Math.min(state.page, totalPages));
  const firstVisiblePage = Math.max(1, Math.min(safePage - 2, totalPages - 4));
  const visiblePages = Array.from(
    { length: Math.min(totalPages, 5) },
    (_, index) => firstVisiblePage + index
  );
  const pageItems = filteredProducts;

  useEffect(() => {
    writeStateToUrl(state);
    const query = new URLSearchParams(window.location.search);
    const nextPath = query.toString() ? `/products?${query}` : "/products";
    const currentPath = `${window.location.pathname}${window.location.search}`;

    if (nextPath !== currentPath) {
      router.replace(nextPath);
    }
  }, [router, state]);

  useEffect(() => {
    if (state.page !== safePage) {
      setState((previous) => ({ ...previous, page: safePage }));
    }
  }, [safePage, state.page]);

  useEffect(() => {
    if (keywordInput === state.keyword) {
      return;
    }

    const timer = window.setTimeout(() => {
      setState((previous) => ({
        ...previous,
        keyword: keywordInput,
        page: 1
      }));
    }, 350);

    return () => window.clearTimeout(timer);
  }, [keywordInput, state.keyword]);

  function updateState(next: Partial<CatalogState>) {
    setState((previous) => {
      return { ...previous, ...next };
    });
  }

  function updateAttrFilter(
    code: string,
    value: string[] | { max?: string; min?: string } | null
  ) {
    updateState({
      attrFilters: {
        ...state.attrFilters,
        ...(value ? { [code]: value } : {})
      },
      page: 1
    });

    if (!value) {
      setState((previous) => {
        const next = { ...previous.attrFilters };
        delete next[code];
        return { ...previous, attrFilters: next, page: 1 };
      });
    }
  }

  function getAttributeOptions(definition: ProductAttributeDefinition) {
    const values = new Set<string>();

    products
      .forEach((product) => {
        const value = product.attributes.find(
          (item) => item.definitionId === definition.id
        );

        if (value?.valueText) {
          values.add(value.valueText);
        }
      });

    return Array.from(values).sort((a, b) => a.localeCompare(b, "zh-CN"));
  }

  return (
    <main className="mx-auto max-w-[1200px] px-6">
      <div className="py-4 text-sm text-muted-foreground">
        <Link className="hover:text-foreground" href="/">
          {common.home}
        </Link>
        <span className="mx-2">/</span>
        <Link className="hover:text-foreground" href="/products">
          {t.breadcrumb}
        </Link>
        {activeCategory ? (
          <>
            <span className="mx-2">/</span>
          <span>{categoryName(activeCategory)}</span>
          </>
        ) : null}
      </div>

      <div className="layout-with-sidebar">
        <aside>
          <div className="filter-panel">
            <h4>{t.categoryTitle}</h4>
            <ul className="category-tree">
              <li>
                <button
                  className={!state.categorySlug ? "is-active" : ""}
                  onClick={() => updateState({ categorySlug: "", page: 1 })}
                  type="button"
                >
                  <span className="category-name">{t.allProducts}</span>
                  <span className="count">{totalProducts}</span>
                </button>
              </li>
              {categories.map((category) => (
                <li key={category.id}>
                  <button
                    className={
                      state.categorySlug === category.slug ? "is-active" : ""
                    }
                    onClick={() =>
                      updateState({ categorySlug: category.slug, page: 1 })
                    }
                    type="button"
                  >
                    <span className="category-name">{categoryName(category)}</span>
                    <span className="count">
                      {countProducts(products, category.slug)}
                    </span>
                  </button>
                  {category.subcategories?.length ? (
                    <ul className="children">
                      {category.subcategories.map((subcategory) => (
                        <li key={subcategory.id}>
                          <button
                            className={
                              state.categorySlug === subcategory.slug
                                ? "is-active"
                                : ""
                            }
                            onClick={() =>
                              updateState({
                                categorySlug: subcategory.slug,
                                page: 1
                              })
                            }
                            type="button"
                          >
                            <span className="category-name">
                              {locale === "en" && subcategory.nameEn
                                ? subcategory.nameEn
                                : subcategory.name}
                            </span>
                            <span className="count">
                              {countProducts(products, subcategory.slug)}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          {activeCategory && activeAttributeDefinitions.length ? (
            <div className="filter-panel">
              <h4>{t.filterByAttributes}</h4>
              {activeAttributeDefinitions.map((definition) => {
                const current = state.attrFilters[definition.code];

                if (definition.dataType === "number") {
                  const range = Array.isArray(current) ? {} : current ?? {};

                  return (
                    <div
                      className="attr-filter-group"
                      data-code={definition.code}
                      data-type="number"
                      key={definition.id}
                    >
                      <div className="attr-name">
                        {definition.name}
                        <span className="attr-unit">{definition.unit}</span>
                      </div>
                      <div className="range-inputs">
                        <input
                          onChange={(event) =>
                            updateAttrFilter(definition.code, {
                              ...range,
                              min: event.target.value
                            })
                          }
                          placeholder={t.min}
                          type="number"
                          value={range.min ?? ""}
                        />
                        <span>—</span>
                        <input
                          onChange={(event) =>
                            updateAttrFilter(definition.code, {
                              ...range,
                              max: event.target.value
                            })
                          }
                          placeholder={t.max}
                          type="number"
                          value={range.max ?? ""}
                        />
                      </div>
                    </div>
                  );
                }

                const selected = new Set(Array.isArray(current) ? current : []);
                const options = getAttributeOptions(definition);

                return (
                  <div
                    className="attr-filter-group"
                    data-code={definition.code}
                    data-type="enum"
                    key={definition.id}
                  >
                    <div className="attr-name">{definition.name}</div>
                    {options.map((option) => (
                      <label className="checkbox-row" key={option}>
                        <input
                          checked={selected.has(option)}
                          onChange={(event) => {
                            const next = new Set(selected);

                            if (event.target.checked) {
                              next.add(option);
                            } else {
                              next.delete(option);
                            }

                            updateAttrFilter(
                              definition.code,
                              next.size ? Array.from(next) : null
                            );
                          }}
                          type="checkbox"
                          value={option}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                );
              })}
              <button
                className="filter-reset"
                onClick={() => updateState({ attrFilters: {}, page: 1 })}
                type="button"
              >
                {t.clearFilters}
              </button>
            </div>
          ) : null}
        </aside>

        <section>
          {state.keyword.trim() ? (
            <div className="search-keyword-banner">
              {t.keywordResultPrefix} <strong>{totalProducts}</strong>{" "}
              {t.keywordResultSuffix} “{state.keyword.trim()}”
            </div>
          ) : null}

          <div className="results-toolbar">
            <div className="results-count">
              {t.resultCountPrefix} <strong>{totalProducts}</strong>{" "}
              {t.resultCountSuffix}
            </div>
            <div className="toolbar-right">
              <div className="search-box">
                <span>🔍</span>
                <input
                  onChange={(event) => setKeywordInput(event.target.value)}
                  placeholder={t.searchPlaceholder}
                  type="search"
                  value={keywordInput}
                />
              </div>
              <select
                className="sort-select"
                onChange={(event) =>
                  updateState({
                    page: 1,
                    sort: event.target.value as CatalogState["sort"]
                  })
                }
                value={state.sort}
              >
                <option value="newest">{t.publishedNewest}</option>
                <option value="name_asc">{t.sortName}</option>
                <option value="model_asc">{t.sortModel}</option>
              </select>
            </div>
          </div>

          {activeCategory ||
          state.keyword.trim() ||
          Object.keys(state.attrFilters).length ? (
            <div className="active-filters">
              {activeCategory ? (
                <span className="filter-chip">
                  {t.activeCategory}
                  {activeCategory.name}
                  <button
                    onClick={() => updateState({ categorySlug: "", page: 1 })}
                    type="button"
                  >
                    ×
                  </button>
                </span>
              ) : null}
              {state.keyword.trim() ? (
                <span className="filter-chip">
                  {t.keyword}
                  {state.keyword.trim()}
                  <button
                    onClick={() => {
                      setKeywordInput("");
                      updateState({ keyword: "", page: 1 });
                    }}
                    type="button"
                  >
                    ×
                  </button>
                </span>
              ) : null}
              {Object.entries(state.attrFilters).map(([code, value]) => {
                const definition = attributeDefinitions.find(
                  (item) => item.code === code
                );
                const label = definition?.name ?? code;
                const text = Array.isArray(value)
                  ? `${label}: ${value.join(" / ")}`
                  : `${label}: ${value.min || t.noLimit} - ${
                      value.max || t.noLimit
                    }${
                      definition?.unit ?? ""
                    }`;

                return (
                  <span className="filter-chip" key={code}>
                    {text}
                    <button
                      onClick={() => updateAttrFilter(code, null)}
                      type="button"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          ) : null}

          <div className="product-grid catalog-product-grid">
            {pageItems.length ? (
              pageItems.map((product) => (
                <article className="product-card" key={product.id}>
                  <Link className="thumb" href={`/products/${product.slug}`}>
                    {product.isFeatured ? (
                      <span className="badge badge-featured">
                        {common.featured}
                      </span>
                    ) : null}
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img alt={product.name} src={product.imageUrl} />
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        {common.noImage}
                      </span>
                    )}
                  </Link>
                  <div className="body">
                    <span className="model-number">{product.modelNumber}</span>
                    <h3>{product.name}</h3>
                    <p className="summary">{product.summary || ""}</p>
                    <div className="card-actions">
                      <Link
                        className="btn btn-outline btn-sm"
                        href={`/products/${product.slug}`}
                      >
                        {common.viewDetails}
                      </Link>
                      <button
                        className="btn btn-add-cart btn-sm"
                        onClick={() => addToCart(product)}
                        type="button"
                      >
                        {common.addToQuote}
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
                <div className="icon">🔍</div>
                <p>{t.empty}</p>
              </div>
            )}
          </div>

          {totalPages > 1 ? (
            <nav aria-label={t.paginationLabel} className="pagination catalog-pagination">
              <button
                aria-label={t.previousPage}
                disabled={safePage === 1}
                onClick={() => updateState({ page: safePage - 1 })}
                type="button"
              >
                <ChevronLeft aria-hidden="true" size={16} />
              </button>
              {visiblePages.map((page) => (
                <button
                  aria-current={page === safePage ? "page" : undefined}
                  aria-label={`${t.pageLabel} ${page}`}
                  className={page === safePage ? "is-active" : ""}
                  key={page}
                  onClick={() => updateState({ page })}
                  type="button"
                >
                  {page}
                </button>
              ))}
              <button
                aria-label={t.nextPage}
                disabled={safePage === totalPages}
                onClick={() => updateState({ page: safePage + 1 })}
                type="button"
              >
                <ChevronRight aria-hidden="true" size={16} />
              </button>
              <span className="catalog-total-pages">{t.totalPages(totalPages)}</span>
              <form
                className="catalog-page-jump"
                onSubmit={(event) => {
                  event.preventDefault();
                  const target = Number(jumpPage);

                  if (Number.isInteger(target) && target >= 1 && target <= totalPages) {
                    updateState({ page: target });
                    setJumpPage("");
                  }
                }}
              >
                <label htmlFor="catalog-jump-page">{t.goToPage}</label>
                <input
                  id="catalog-jump-page"
                  inputMode="numeric"
                  max={totalPages}
                  min={1}
                  onChange={(event) => setJumpPage(event.target.value)}
                  type="number"
                  value={jumpPage}
                />
                <button className="catalog-go-button" type="submit">Go</button>
              </form>
            </nav>
          ) : null}
        </section>
      </div>
    </main>
  );
}
