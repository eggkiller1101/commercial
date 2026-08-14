/**
 * data-service.js
 * ----------------------------------------------------------------------------
 * 整个原型唯一"知道数据从哪来"的文件。所有页面脚本 (products-page.js /
 * category-page.js / product-page.js) 只调用这里导出的函数，不直接碰
 * mock-data.js 或 supabase-js —— 这跟 apps/cms 里"页面不直接查数据库，
 * 统一走各自模块的 data.ts"是同一个工程原则，好处是：以后从"模拟数据"
 * 切到"真实 Supabase"，或者把这套原型迁移进 Next.js 正式工程，改动都只
 * 集中在这一个文件里。
 *
 * 数据流：
 *   fetchRaw*()   —— 从 mock-data.js 或 Supabase 拿"原始表结构"的行
 *                     （字段名跟 schema.sql 完全一致）
 *   normalize*()  —— 把原始行拼装成页面直接可用的"视图模型"
 *                     （驼峰命名、已经把分类名/规格名/单位都拼好）
 *   get*()        —— 对外暴露的函数：原始数据 + 归一化 + 筛选/排序/分页
 */

const DataService = (() => {
  const config = window.APP_CONFIG;
  const isLive = Boolean(config.SUPABASE_URL && config.SUPABASE_ANON_KEY);

  // 只有配置了真实项目地址时才会用到 supabase-js（在 HTML 里通过 CDN 引入，
  // 全局变量名叫 `supabase`，是官方 UMD 包暴露的命名空间，注意跟"业务对象"
  // 没有关系，纯粹是这个 npm 包自己的全局名）。
  const supabaseClient = isLive
    ? window.supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY)
    : null;

  console.info(
    `[DataService] 当前数据源：${isLive ? "真实 Supabase (" + config.SUPABASE_URL + ")" : "本地模拟数据 (js/mock-data.js)"}`
  );

  // ==========================================================================
  // 1. fetchRaw* —— 拿原始表数据
  // ==========================================================================

  // ----------------------------------------------------------------------------
  // ⚠️ 2026-08 真实数据排查记录：
  // 仓库里 schema.sql 写的是"两级"分类模型——categories 表自引用 parent_id，
  // products 直接挂 category_id。但实际生产 Supabase 库比 schema.sql 多了一张
  // 独立的 subcategories 表：categories（大类）→ subcategories（子类，带
  // category_id 外键指回大类）→ products（挂 subcategory_id，不是 category_id）。
  // 这正是"产品页明明数据库里有数据却一个都不显示"的根因：旧代码查
  // products.category_id 这个根本不存在的列，PostgREST 直接报错，
  // catch 到 error 后静默返回 []，页面就"看起来"没数据、控制台才有报错。
  //
  // 修复思路：不去动下面 getCategoryTree / getCategoryBySlug / toProductCard /
  // getProducts 等一大串已经写好的"分类树"逻辑（它们都是通过通用的
  // category.id / category.parent_id / product.category_id 三个字段工作的，
  // 跟"到底是两级还是三级"无关）。只在这里、在"拿原始数据"这一层，把三级
  // 结构"拍平"成同一套 { id, parent_id, ... } 形状去适配旧逻辑：
  //   - categories 表的行：id 前面加 "cat-" 前缀，parent_id 固定为 null（顶级）
  //   - subcategories 表的行：id 前面加 "sub-" 前缀，parent_id 设为
  //     "cat-" + 该行的 category_id（指回它所属的大类）
  // 这样 categories.id 和 subcategories.id 各自独立生成的自增序号
  // （两边都可能从 1 开始）就不会互相"撞车"混淆。
  // fetchRawProducts() 里同理会把 product.subcategory_id 转成
  // "sub-" + subcategory_id 存进 product.category_id 字段，让它跟这里拼出来的
  // id 对得上。
  // ----------------------------------------------------------------------------
  async function fetchRawCategories() {
    if (!isLive) {
      return window.MOCK_DB.categories;
    }

    // 用 select("*") 而不是显式列名单：真实表的列跟 schema.sql 已经对不上了，
    // 与其继续猜列名（猜错了 Supabase 会直接报"列不存在"整条查询失败），
    // 不如整行拿回来，is_active / sort_order 这些放到下面用 JS 处理，
    // 就算某个字段实际不存在也只是 undefined，不会让查询报错。
    const [catRes, subRes] = await Promise.all([
      supabaseClient.from("categories").select("*"),
      supabaseClient.from("subcategories").select("*")
    ]);

    if (catRes.error) {
      console.error("[DataService] 读取 categories 失败", catRes.error);
      return [];
    }
    if (subRes.error) {
      // subcategories 大概率是新加的表，如果 policy.sql 还没补上
      // public_read_subcategories 这条策略，anon key 会被 RLS 拦掉。
      // 这里不让它拖垮整个分类树——没有子类，至少大类还能正常显示。
      console.error(
        "[DataService] 读取 subcategories 失败（请检查 Supabase 是否已为 subcategories 表添加 anon 可读的 RLS 策略）",
        subRes.error
      );
    }

    const topLevel = (catRes.data || [])
      .filter((c) => c.is_active !== false)
      .map((c) => ({
        ...c,
        id: `cat-${c.id}`,
        parent_id: null,
        sort_order: c.sort_order || 0
      }));

    const subLevel = (subRes.data || [])
      .filter((s) => s.is_active !== false)
      .map((s) => ({
        ...s,
        id: `sub-${s.id}`,
        parent_id: `cat-${s.category_id}`,
        sort_order: s.sort_order || 0
      }));

    // ----------------------------------------------------------------------
    // ⚠️ 2026-08 补充排查："二级分类点了不筛选产品" 的根因：
    // categories.slug 在 schema.sql 里是 UNIQUE NOT NULL，值肯定靠谱；但
    // subcategories 是后加的表，它的 slug 有没有唯一约束、甚至有没有填全，
    // 都没法从这边确认。真实情况很可能是：不同大类下的子类用了重复的 slug
    // （比如两个大类下都有个子类叫"配件"/slug 都是 "peijian"），或者干脆
    // 没填 slug。而 findCategory()/findCategoryNode() 是直接拿 slug 去一个
    // 拍平的数组里 find 第一个匹配项——slug 一撞车或者是空的，点击某个二级
    // 分类的时候，实际定位到的可能是"另一个同名子类"甚至"什么都找不到"，
    // 筛选看起来就跟没生效一样（要么筛出一堆不相关的，要么范围完全没变窄）。
    //
    // 这里做一次全局兜底去重：先处理大类（topLevel 在前），大类的 slug
    // 保留原样、完全不受影响；子类如果 slug 缺失就退化成 "node-{id}"，
    // 如果撞上了前面已经出现过的 slug（不管是撞大类还是撞另一个子类），
    // 就在后面追加 "-{id}" 变成独一无二。这样"没撞车"的情况（包括所有
    // 目前已经正常工作的大类链接）行为完全不变，只有真正有问题的子类
    // 才会被改写。
    // ----------------------------------------------------------------------
    const seenSlugs = new Set();
    [...topLevel, ...subLevel].forEach((node) => {
      const base = node.slug || `node-${node.id}`;
      const candidate = seenSlugs.has(base) ? `${base}-${node.id}` : base;
      seenSlugs.add(candidate);
      node.slug = candidate;
    });

    return [...topLevel, ...subLevel].sort((a, b) => a.sort_order - b.sort_order);
  }

  async function fetchRawAttributeDefinitions() {
    if (!isLive) {
      return window.MOCK_DB.attributeDefinitions;
    }

    const { data, error } = await supabaseClient.from("attribute_definitions").select("*");

    if (error) {
      console.error("[DataService] 读取 attribute_definitions 失败", error);
      return [];
    }

    // 假设技术参数模板挂在"子类"这一级（跟产品实际所在的层级一致）——
    // 如果你的后台其实是把参数模板挂在大类上，把下面这行的 "sub-" 改成 "cat-" 即可。
    return (data || [])
      .map((d) => ({ ...d, category_id: `sub-${d.category_id}`, sort_order: d.sort_order || 0 }))
      .sort((a, b) => a.sort_order - b.sort_order);
  }

  // 产品原始数据一次性带出图片 / 规格值 / SKU / 关联文档（嵌套 select，
  // PostgREST 会按外键关系自动 JOIN）。原型阶段目录规模不大，"整表拉回来
  // 再在前端筛选/排序/分页"是合理的取舍；如果产品数量涨到成百上千，
  // 应该把筛选下推成 Supabase 的 .eq()/.gte()/.lte() 链式调用，或者写一个
  // Postgres RPC 函数在数据库端完成筛选分页，避免把整表传到浏览器。
  async function fetchRawProducts() {
    if (!isLive) {
      return window.MOCK_DB.products;
    }

    // 注意：这里不再选 category_id（products 表实际没有这一列，之前就是查这个
    // 不存在的列导致 Supabase 报错、整页产品静默返回空数组）。用 select("*")
    // 把 products 自己的列整行拿回来，真正需要的分类信息是 subcategory_id，
    // 已经包含在 "*" 里了。
    const { data, error } = await supabaseClient
      .from("products")
      .select(
        `*,
         product_images ( image_url, alt_text, is_primary, sort_order ),
         product_attribute_values ( attribute_definition_id, value_text, value_number ),
         product_variants ( sku, variant_name, extra_attributes, is_active ),
         product_documents ( documents ( title, file_url, file_type, file_size_bytes, published_at ) )`
      )
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[DataService] 读取 products 失败", error);
      return [];
    }

    // Supabase 返回的字段名是 product_images / product_attribute_values / product_variants，
    // 这里统一改成跟 mock-data.js 一样的简短字段名 (images / attribute_values / variants / documents)，
    // 后面的 normalize 函数就不用区分数据来源了。
    // category_id 则是"三级分类拍平"兼容层的关键一步：把真实的 subcategory_id
    // 转成跟 fetchRawCategories() 里 subcategories 行一致的 "sub-{id}" 形式，
    // 这样下面 toProductCard / getCategoryBySlug / getProducts 等一大串沿用
    // 旧版"两级模型"字段名写的逻辑，完全不用改一行就能在三级结构上正确工作。
    return data.map((row) => ({
      ...row,
      category_id: row.subcategory_id !== null && row.subcategory_id !== undefined ? `sub-${row.subcategory_id}` : null,
      images: row.product_images || [],
      attribute_values: row.product_attribute_values || [],
      variants: (row.product_variants || []).filter((v) => v.is_active !== false),
      documents: (row.product_documents || [])
        .map((pd) => pd.documents)
        .filter((doc) => doc && doc.published_at)
    }));
  }

  // ==========================================================================
  // 2. 归一化辅助函数
  // ==========================================================================

  let categoriesCache = null;
  let attributeDefsCache = null;
  let productsCache = null;

  async function getCategoriesFlat() {
    if (!categoriesCache) {
      categoriesCache = await fetchRawCategories();
    }
    return categoriesCache;
  }

  async function getAttributeDefsFlat() {
    if (!attributeDefsCache) {
      attributeDefsCache = await fetchRawAttributeDefinitions();
    }
    return attributeDefsCache;
  }

  async function getProductsRaw() {
    if (!productsCache) {
      productsCache = await fetchRawProducts();
    }
    return productsCache;
  }

  function findCategory(categories, slug) {
    return categories.find((c) => c.slug === slug) || null;
  }

  function getChildren(categories, parentId) {
    return categories.filter((c) => c.parent_id === parentId);
  }

  // 从任意子分类往上找到顶级祖先分类，用于面包屑 / 侧边栏高亮
  function getAncestorChain(categories, category) {
    const chain = [category];
    let current = category;
    while (current && current.parent_id) {
      current = categories.find((c) => c.id === current.parent_id);
      if (current) chain.unshift(current);
    }
    return chain;
  }

  function primaryImageOf(product) {
    const images = product.images || [];
    const primary = images.find((img) => img.is_primary) || images[0];
    return primary ? primary.image_url : "assets/icons/generic-product.svg";
  }

  function buildSpecList(product, attributeDefs) {
    const defsById = new Map(attributeDefs.map((d) => [d.id, d]));
    return (product.attribute_values || [])
      .map((av) => {
        const def = defsById.get(av.attribute_definition_id);
        if (!def) return null;
        const value = av.value_number !== null && av.value_number !== undefined ? av.value_number : av.value_text;
        return {
          code: def.code,
          name: def.name,
          unit: def.unit || "",
          dataType: def.data_type,
          value
        };
      })
      .filter(Boolean)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }

  async function toProductCard(product) {
    const categories = await getCategoriesFlat();
    const category = categories.find((c) => c.id === product.category_id);
    return {
      id: product.id,
      slug: product.slug,
      modelNumber: product.model_number,
      name: product.name,
      summary: product.summary,
      isFeatured: Boolean(product.is_featured),
      categoryId: product.category_id,
      categoryName: category ? category.name : "",
      categorySlug: category ? category.slug : "",
      primaryImageUrl: primaryImageOf(product)
    };
  }

  async function toProductDetail(product) {
    const [categories, attributeDefs] = await Promise.all([getCategoriesFlat(), getAttributeDefsFlat()]);
    const category = categories.find((c) => c.id === product.category_id);
    const images = (product.images || [])
      .slice()
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0) || (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));

    return {
      id: product.id,
      slug: product.slug,
      modelNumber: product.model_number,
      name: product.name,
      summary: product.summary,
      description: product.description,
      applicationNotes: product.application_notes,
      isFeatured: Boolean(product.is_featured),
      viewCount: product.view_count || 0,
      categoryId: product.category_id,
      categoryName: category ? category.name : "",
      categorySlug: category ? category.slug : "",
      images: images.length ? images : [{ image_url: "assets/icons/generic-product.svg", alt_text: product.name, is_primary: true }],
      specs: buildSpecList(product, attributeDefs),
      variants: product.variants || [],
      documents: product.documents || []
    };
  }

  // ==========================================================================
  // 3. 对外暴露的查询函数（页面脚本只调用这些）
  // ==========================================================================

  /** 分类树：只返回顶级分类，每个分类下挂 children 数组（二级分类） */
  async function getCategoryTree() {
    const categories = await getCategoriesFlat();
    const topLevel = getChildren(categories, null);
    return topLevel.map((top) => ({
      ...top,
      children: getChildren(categories, top.id)
    }));
  }

  /**
   * 按 slug 取分类详情，附带：
   *  - breadcrumb: 从顶级到当前分类的祖先链
   *  - children: 直接子分类
   *  - featuredProducts: 该分类（含子分类）下 is_featured = true 的产品卡片
   */
  async function getCategoryBySlug(slug) {
    const categories = await getCategoriesFlat();
    const category = findCategory(categories, slug);
    if (!category) return null;

    const children = getChildren(categories, category.id);
    const breadcrumb = getAncestorChain(categories, category);

    // 该分类自己 + 所有子分类的 id，用于统计"这个大类下有多少产品"
    const categoryIds = new Set([category.id, ...children.map((c) => c.id)]);

    const productsRaw = await getProductsRaw();
    const matched = productsRaw.filter((p) => categoryIds.has(p.category_id));
    const featuredRaw = matched.filter((p) => p.is_featured).slice(0, 4);
    const featuredProducts = await Promise.all(featuredRaw.map(toProductCard));

    return {
      ...category,
      breadcrumb,
      children,
      productCount: matched.length,
      featuredProducts
    };
  }

  /** 某分类下可用于筛选器的技术参数定义（is_filterable = true） */
  async function getFilterableAttributeDefs(categoryId) {
    const defs = await getAttributeDefsFlat();
    return defs.filter((d) => d.category_id === categoryId && d.is_filterable);
  }

  /**
   * 枚举/文本类型的技术参数，筛选器需要知道"这个分类下实际出现过哪些取值"
   * 才能画出勾选项（比如"材质"筛选器要显示"可锻铸铁 / 球墨铸铁 / 碳钢"）。
   * 数字类型的参数不需要这个函数，直接给一个最小值/最大值输入框即可。
   */
  async function getAttributeOptions(categoryId, code) {
    const attributeDefs = await getAttributeDefsFlat();
    const def = attributeDefs.find((d) => d.category_id === categoryId && d.code === code);
    if (!def) return [];

    const productsRaw = await getProductsRaw();
    const values = new Set();
    productsRaw
      .filter((p) => p.category_id === categoryId)
      .forEach((p) => {
        (p.attribute_values || []).forEach((av) => {
          if (av.attribute_definition_id === def.id && av.value_text) {
            values.add(av.value_text);
          }
        });
      });
    return Array.from(values).sort((a, b) => a.localeCompare(b, "zh-CN"));
  }

  /**
   * 产品列表查询，一次性完成"按分类筛选 + 按规格筛选 + 关键字搜索 + 排序 + 分页"。
   *
   * @param {Object} params
   * @param {string=} params.categorySlug   只看这个分类（含其子分类）
   * @param {string=} params.keyword        按名称/型号模糊搜索
   * @param {Object=} params.attrFilters    形如 { pipe_diameter: { min: 50, max: 150 }, material: ["可锻铸铁", "球墨铸铁"] }
   * @param {string=} params.sort           "newest" | "name_asc" | "model_asc"
   * @param {number=} params.page           从 1 开始
   * @param {number=} params.pageSize
   */
  async function getProducts(params = {}) {
    const {
      categorySlug = null,
      keyword = "",
      attrFilters = {},
      sort = "newest",
      page = 1,
      pageSize = config.PRODUCT_PAGE_SIZE
    } = params;

    const categories = await getCategoriesFlat();
    const attributeDefs = await getAttributeDefsFlat();
    let productsRaw = await getProductsRaw();

    // -- 1) 按分类筛选（选中一个大类时，子分类的产品也要一起显示） --
    if (categorySlug) {
      const category = findCategory(categories, categorySlug);
      if (category) {
        const childIds = getChildren(categories, category.id).map((c) => c.id);
        const categoryIds = new Set([category.id, ...childIds]);
        productsRaw = productsRaw.filter((p) => categoryIds.has(p.category_id));
      }
    }

    // -- 2) 关键字搜索（名称 / 型号） --
    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      productsRaw = productsRaw.filter(
        (p) => p.name.toLowerCase().includes(kw) || p.model_number.toLowerCase().includes(kw)
      );
    }

    // -- 3) 技术参数筛选：模拟数据库里 product_attribute_values 的过滤逻辑 --
    const defsByCode = new Map(attributeDefs.map((d) => [d.code, d]));
    Object.entries(attrFilters).forEach(([code, filterValue]) => {
      const def = defsByCode.get(code);
      if (!def || !filterValue) return;

      productsRaw = productsRaw.filter((p) => {
        const av = (p.attribute_values || []).find((v) => {
          const d = attributeDefs.find((d2) => d2.id === v.attribute_definition_id);
          return d && d.code === code;
        });
        if (!av) return false;

        if (def.data_type === "number") {
          const value = av.value_number;
          if (value === null || value === undefined) return false;
          const { min, max } = filterValue;
          if (min !== undefined && min !== null && min !== "" && value < Number(min)) return false;
          if (max !== undefined && max !== null && max !== "" && value > Number(max)) return false;
          return true;
        }

        // enum / text：filterValue 是选中的值数组
        return Array.isArray(filterValue) && filterValue.includes(av.value_text);
      });
    });

    // -- 4) 排序 --
    const sorted = productsRaw.slice().sort((a, b) => {
      if (sort === "name_asc") return a.name.localeCompare(b.name, "zh-CN");
      if (sort === "model_asc") return a.model_number.localeCompare(b.model_number, "zh-CN");
      // "newest"：mock 数据没有 created_at，用 id 倒序模拟"最新在前"
      return b.id - a.id;
    });

    // -- 5) 分页 --
    const total = sorted.length;
    const totalPages = Math.max(Math.ceil(total / pageSize), 1);
    const safePage = Math.min(Math.max(page, 1), totalPages);
    const start = (safePage - 1) * pageSize;
    const pageItems = sorted.slice(start, start + pageSize);

    const items = await Promise.all(pageItems.map(toProductCard));

    return { items, total, page: safePage, pageSize, totalPages };
  }

  async function getProductBySlug(slug) {
    const productsRaw = await getProductsRaw();
    const product = productsRaw.find((p) => p.slug === slug || String(p.id) === String(slug));
    if (!product) return null;
    return toProductDetail(product);
  }

  /**
   * 首页"主推产品"用：跨所有分类取 is_featured = true 的产品。
   * 注意不要用 getProducts({ pageSize: 4 }) 简单取"最新 4 个"再过滤 is_featured——
   * 那样只要重点产品的 id 不在最新几个里就会被漏掉（这是上一版首页脚本的一个
   * 隐藏 bug）。这里直接对全量产品过滤，保证重点产品不会因为分页而丢失。
   */
  async function getFeaturedProducts(limit = 6) {
    const productsRaw = await getProductsRaw();
    const featured = productsRaw.filter((p) => p.is_featured).slice(0, limit);
    return Promise.all(featured.map(toProductCard));
  }

  /**
   * 产品中心树状图专用：分类树 + 每个节点下的产品数量统计。
   * 顶级分类的 productCount 是"自己 + 全部子分类"的产品总数，
   * 子分类的 productCount 只统计直接挂在这个子分类下的产品——
   * 这样树状图上每一层节点旁边的数字口径都跟"点进去实际看到几款产品"一致。
   */
  async function getCategoryTreeWithCounts() {
    const tree = await getCategoryTree();
    const productsRaw = await getProductsRaw();

    const countByCategoryId = new Map();
    productsRaw.forEach((p) => {
      countByCategoryId.set(p.category_id, (countByCategoryId.get(p.category_id) || 0) + 1);
    });

    return tree.map((top) => {
      const children = top.children.map((child) => ({
        ...child,
        productCount: countByCategoryId.get(child.id) || 0
      }));
      const ownCount = countByCategoryId.get(top.id) || 0;
      const childrenCount = children.reduce((sum, c) => sum + c.productCount, 0);
      return {
        ...top,
        children,
        productCount: ownCount + childrenCount
      };
    });
  }

  /**
   * 资料中心页专用：把所有产品挂载的技术文档拍平成一个列表，
   * 每条文档附带来源产品信息，方便资料中心页展示"这份资料属于哪个产品"。
   */
  async function getAllDocuments() {
    const productsRaw = await getProductsRaw();
    const categories = await getCategoriesFlat();
    const docs = [];
    productsRaw.forEach((p) => {
      const category = categories.find((c) => c.id === p.category_id);
      (p.documents || []).forEach((doc) => {
        docs.push({
          ...doc,
          productName: p.name,
          productSlug: p.slug,
          categoryName: category ? category.name : ""
        });
      });
    });
    return docs;
  }

  /** 相关产品推荐：同分类下除自己以外的产品，取前 N 个 */
  async function getRelatedProducts(categoryId, excludeProductId, limit = 4) {
    const productsRaw = await getProductsRaw();
    const related = productsRaw.filter((p) => p.category_id === categoryId && p.id !== excludeProductId).slice(0, limit);
    return Promise.all(related.map(toProductCard));
  }

  /**
   * 提交询价表单。
   * 真实模式：INSERT 进 inquiries 表 —— 对应 policy.sql 里专门为 anon 开放的
   *   "public_insert_inquiries" 策略（只允许插入 status = 'new' 的行，
   *   不允许 anon 读取，所以前端插入成功后拿不到、也不需要拿到这条记录本身）。
   * 模拟模式：打印到控制台，模拟网络延时后返回成功。
   */
  async function submitInquiry(payload) {
    if (!isLive) {
      console.info("[DataService] (模拟) 收到询价表单：", payload);
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { ok: true };
    }

    const { error } = await supabaseClient.from("inquiries").insert({
      name: payload.name,
      company: payload.company || null,
      phone: payload.phone || null,
      email: payload.email || null,
      product_id: payload.productId || null,
      message: payload.message || null,
      status: "new"
    });

    if (error) {
      console.error("[DataService] 提交询价失败", error);
      return { ok: false, message: error.message };
    }
    return { ok: true };
  }

  return {
    isLive,
    getCategoryTree,
    getCategoryTreeWithCounts,
    getCategoryBySlug,
    getFilterableAttributeDefs,
    getAttributeOptions,
    getProducts,
    getProductBySlug,
    getFeaturedProducts,
    getRelatedProducts,
    getAllDocuments,
    submitInquiry
  };
})();