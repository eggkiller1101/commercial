"use client";

import Link from "next/link";
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

const pageSize = 8;

type CatalogState = {
  attrFilters: Record<string, string[] | { max?: string; min?: string }>;
  categorySlug: string;
  keyword: string;
  page: number;
  sort: "newest" | "name_asc" | "model_asc";
};

function getInitialState(): CatalogState {
  if (typeof window === "undefined") {
    return {
      attrFilters: {},
      categorySlug: "",
      keyword: "",
      page: 1,
      sort: "newest"
    };
  }

  const params = new URLSearchParams(window.location.search);
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

function productMatchesCategory(product: ProductCardItem, categorySlug: string) {
  if (!categorySlug) {
    return true;
  }

  return (
    product.categorySlug === categorySlug ||
    product.subcategorySlug === categorySlug ||
    product.subcategoryId === categorySlug
  );
}

function productMatchesKeyword(product: ProductCardItem, keyword: string) {
  const value = keyword.trim().toLowerCase();

  if (!value) {
    return true;
  }

  return (
    product.name.toLowerCase().includes(value) ||
    product.modelNumber.toLowerCase().includes(value)
  );
}

function productMatchesAttributes(
  product: ProductCardItem,
  definitions: ProductAttributeDefinition[],
  attrFilters: CatalogState["attrFilters"]
) {
  return Object.entries(attrFilters).every(([code, value]) => {
    const definition = definitions.find((item) => item.code === code);

    if (!definition) {
      return true;
    }

    const productValue = product.attributes.find(
      (item) => item.definitionId === definition.id
    );

    if (!productValue) {
      return false;
    }

    if (definition.dataType === "number" && !Array.isArray(value)) {
      const numberValue = productValue.valueNumber;

      if (numberValue === null || numberValue === undefined) {
        return false;
      }

      if (value.min && numberValue < Number(value.min)) {
        return false;
      }

      if (value.max && numberValue > Number(value.max)) {
        return false;
      }

      return true;
    }

    return Array.isArray(value) && productValue.valueText
      ? value.includes(productValue.valueText)
      : false;
  });
}

function countProducts(products: ProductCardItem[], slug: string) {
  return products.filter((product) => productMatchesCategory(product, slug)).length;
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

export function ProductsCatalog({
  attributeDefinitions,
  categories,
  locale = defaultLocale,
  products
}: {
  attributeDefinitions: ProductAttributeDefinition[];
  categories: CategoryItem[];
  locale?: Locale;
  products: ProductCardItem[];
}) {
  const dictionary = getDictionary(locale);
  const t = dictionary.products;
  const common = dictionary.common;
  const [state, setState] = useState<CatalogState>(getInitialState);
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

  const filteredProducts = useMemo(() => {
    const next = products
      .filter((product) => productMatchesCategory(product, state.categorySlug))
      .filter((product) => productMatchesKeyword(product, state.keyword))
      .filter((product) =>
        productMatchesAttributes(product, attributeDefinitions, state.attrFilters)
      );

    return [...next].sort((a, b) => {
      if (state.sort === "name_asc") {
        return a.name.localeCompare(b.name, "zh-CN");
      }

      if (state.sort === "model_asc") {
        return a.modelNumber.localeCompare(b.modelNumber, "zh-CN");
      }

      return Number(b.id) - Number(a.id);
    });
  }, [attributeDefinitions, products, state]);

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

  const totalPages = Math.max(Math.ceil(filteredProducts.length / pageSize), 1);
  const safePage = Math.min(state.page, totalPages);
  const pageItems = filteredProducts.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );
  const totalProducts = products.length;

  useEffect(() => {
    writeStateToUrl(state);
  }, [state]);

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
      .filter((product) => productMatchesCategory(product, state.categorySlug))
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
            <span>{activeCategory.name}</span>
          </>
        ) : null}
      </div>

      {!state.categorySlug ? (
        <section className="pb-6 pt-3">
          <div className="category-tree-diagram">
            <div className="tree-diagram-head">
              <div>
                <h2>{t.categoryOverview}</h2>
                <p>{t.categoryOverviewDesc}</p>
              </div>
              <div className="tree-diagram-legend">
                <span>
                  <span className="dot l1" />
                  {t.overview}
                </span>
                <span>
                  <span className="dot l2" />
                  {t.childCategory}
                </span>
              </div>
            </div>
            <ul className="org-tree">
              <li>
                <button
                  className="tree-node tree-node-root"
                  onClick={() =>
                    updateState({ categorySlug: "", page: 1 })
                  }
                  type="button"
                >
                  {t.allProducts}
                  <span className="tree-node-count">{totalProducts}</span>
                </button>
                <ul>
                  {categories.map((category) => {
                    const categoryCount = countProducts(products, category.slug);

                    return (
                      <li key={category.id}>
                        <button
                          className="tree-node tree-node-l1"
                          onClick={() =>
                            updateState({
                              categorySlug: category.slug,
                              page: 1
                            })
                          }
                          type="button"
                        >
                          {category.name}
                          <span className="tree-node-count">
                            {categoryCount}
                          </span>
                        </button>
                        {category.subcategories?.length ? (
                          <ul>
                            {category.subcategories.map((subcategory) => {
                              const count = countProducts(
                                products,
                                subcategory.slug
                              );

                              return (
                                <li key={subcategory.id}>
                                  <button
                                    className={`tree-node tree-node-l2 ${
                                      count === 0 ? "is-empty" : ""
                                    }`}
                                    onClick={() =>
                                      updateState({
                                        categorySlug: subcategory.slug,
                                        page: 1
                                      })
                                    }
                                    type="button"
                                  >
                                    {subcategory.name}
                                    <span className="tree-node-count">
                                      {count}
                                    </span>
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </li>
            </ul>
          </div>
        </section>
      ) : null}

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
                  {t.allProducts}
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
                    {category.name}
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
                            {subcategory.name}
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
              {t.keywordResultPrefix} <strong>{filteredProducts.length}</strong>{" "}
              {t.keywordResultSuffix} “{state.keyword.trim()}”
            </div>
          ) : null}

          <div className="results-toolbar">
            <div className="results-count">
              {t.resultCountPrefix} <strong>{filteredProducts.length}</strong>{" "}
              {t.resultCountSuffix}
            </div>
            <div className="toolbar-right">
              <div className="search-box">
                <span>🔍</span>
                <input
                  onChange={(event) =>
                    updateState({
                      keyword: event.target.value,
                      page: 1
                    })
                  }
                  placeholder={t.searchPlaceholder}
                  type="search"
                  value={state.keyword}
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
                    onClick={() => updateState({ keyword: "", page: 1 })}
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

          <div className="product-grid">
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
            <div className="pagination">
              <button
                disabled={safePage === 1}
                onClick={() => updateState({ page: safePage - 1 })}
                type="button"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <button
                    className={page === safePage ? "is-active" : ""}
                    key={page}
                    onClick={() => updateState({ page })}
                    type="button"
                  >
                    {page}
                  </button>
                )
              )}
              <button
                disabled={safePage === totalPages}
                onClick={() => updateState({ page: safePage + 1 })}
                type="button"
              >
                ›
              </button>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
