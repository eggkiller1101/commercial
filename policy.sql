-- ============================================================================
-- RLS Policies
-- ============================================================================
--
-- 直接用service_role key 查 Supabase
--
--   service_role 在 Postgres 里被标记为 BYPASSRLS —— 不管一张表上有没有
--   policy、policy 条件是什么，用 service_role key 发出的查询都会跳过 RLS
--   检查，直接全权限读写。这是 Postgres 层面的机制。
--
-- 后台需要用 service_role key 发请求，天然就已经满足，不需要policy
--
-- ⚠️ service_role key只能放在后台服务器自己的环境变量里，绝对不能出现在
-- 任何会打包发到浏览器的前端代码、Git 仓库或日志里。
-- 前端(浏览器里跑的 JS)永远只用 anon key，靠下面这些 policy 限制它能看到什么 
-- anon key本来就是公开的)，但 service_role key 泄露等于任何人都能绕过下面
-- 所有规则直接读写整个数据库。
-- ============================================================================


-- ============================================================================
-- 确保所有表都开启了 RLS
-- ============================================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE attribute_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_attribute_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- 完全公开的只读表
-- ============================================================================
DROP POLICY IF EXISTS public_read_categories ON categories;
CREATE POLICY public_read_categories
    ON categories FOR SELECT
    TO anon, authenticated
    USING (is_active = TRUE);

DROP POLICY IF EXISTS public_read_attribute_definitions ON attribute_definitions;
CREATE POLICY public_read_attribute_definitions
    ON attribute_definitions FOR SELECT
    TO anon, authenticated
    USING (TRUE);

DROP POLICY IF EXISTS public_read_document_categories ON document_categories;
CREATE POLICY public_read_document_categories
    ON document_categories FOR SELECT
    TO anon, authenticated
    USING (TRUE);

DROP POLICY IF EXISTS public_read_article_categories ON article_categories;
CREATE POLICY public_read_article_categories
    ON article_categories FOR SELECT
    TO anon, authenticated
    USING (TRUE);

DROP POLICY IF EXISTS public_read_tags ON tags;
CREATE POLICY public_read_tags
    ON tags FOR SELECT
    TO anon, authenticated
    USING (TRUE);

DROP POLICY IF EXISTS public_read_site_settings ON site_settings;
CREATE POLICY public_read_site_settings
    ON site_settings FOR SELECT
    TO anon, authenticated
    USING (TRUE);


-- ============================================================================
-- 需要按"发布状态"过滤的核心内容表
-- ============================================================================
DROP POLICY IF EXISTS public_read_published_products ON products;
CREATE POLICY public_read_published_products
    ON products FOR SELECT
    TO anon, authenticated
    USING (
        status = 'published'
        AND (published_at IS NULL OR published_at <= now())
    );

DROP POLICY IF EXISTS public_read_published_articles ON articles;
CREATE POLICY public_read_published_articles
    ON articles FOR SELECT
    TO anon, authenticated
    USING (
        status = 'published'
        AND (published_at IS NULL OR published_at <= now())
    );

DROP POLICY IF EXISTS public_read_published_documents ON documents;
CREATE POLICY public_read_published_documents
    ON documents FOR SELECT
    TO anon, authenticated
    USING (published_at IS NOT NULL AND published_at <= now());


-- ============================================================================
-- 从属表 —— 跟随父表的发布/启用状态
-- ============================================================================
DROP POLICY IF EXISTS public_read_product_images ON product_images;
CREATE POLICY public_read_product_images
    ON product_images FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM products p
            WHERE p.id = product_images.product_id
              AND p.status = 'published'
              AND (p.published_at IS NULL OR p.published_at <= now())
        )
    );

DROP POLICY IF EXISTS public_read_product_attribute_values ON product_attribute_values;
CREATE POLICY public_read_product_attribute_values
    ON product_attribute_values FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM products p
            WHERE p.id = product_attribute_values.product_id
              AND p.status = 'published'
              AND (p.published_at IS NULL OR p.published_at <= now())
        )
    );

DROP POLICY IF EXISTS public_read_product_variants ON product_variants;
CREATE POLICY public_read_product_variants
    ON product_variants FOR SELECT
    TO anon, authenticated
    USING (
        is_active = TRUE
        AND EXISTS (
            SELECT 1 FROM products p
            WHERE p.id = product_variants.product_id
              AND p.status = 'published'
              AND (p.published_at IS NULL OR p.published_at <= now())
        )
    );

DROP POLICY IF EXISTS public_read_product_documents ON product_documents;
CREATE POLICY public_read_product_documents
    ON product_documents FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM products p
            WHERE p.id = product_documents.product_id
              AND p.status = 'published'
              AND (p.published_at IS NULL OR p.published_at <= now())
        )
        AND EXISTS (
            SELECT 1 FROM documents d
            WHERE d.id = product_documents.document_id
              AND d.published_at IS NOT NULL AND d.published_at <= now()
        )
    );

DROP POLICY IF EXISTS public_read_article_tags ON article_tags;
CREATE POLICY public_read_article_tags
    ON article_tags FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM articles a
            WHERE a.id = article_tags.article_id
              AND a.status = 'published'
              AND (a.published_at IS NULL OR a.published_at <= now())
        )
    );

DROP POLICY IF EXISTS public_read_article_products ON article_products;
CREATE POLICY public_read_article_products
    ON article_products FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM articles a
            WHERE a.id = article_products.article_id
              AND a.status = 'published'
              AND (a.published_at IS NULL OR a.published_at <= now())
        )
        AND EXISTS (
            SELECT 1 FROM products p
            WHERE p.id = article_products.product_id
              AND p.status = 'published'
              AND (p.published_at IS NULL OR p.published_at <= now())
        )
    );


-- ============================================================================
-- roles / admin_users —— 不写任何 anon/authenticated policy，
-- 只有 service_role 能访问。你的后台正好是走 service_role，这个设计天然
-- 就是对的，不用加任何东西。
-- ============================================================================
-- (无需任何 CREATE POLICY —— 两张表已在第 1 步 ENABLE ROW LEVEL SECURITY，
--  没有为它们创建任何policy，所有非 service_role 的请求都会被拒绝。)


-- ============================================================================
-- inquiries —— 这是本次唯一真正要改的地方
-- ----------------------------------------------------------------------------
-- 后台走 service_role,天然绕过这里,不需要额外 policy。

DROP POLICY IF EXISTS public_read_inquery ON inquiries;
DROP POLICY IF EXISTS public_select_inquiries ON inquiries;

DROP POLICY IF EXISTS public_insert_inquiries ON inquiries;
CREATE POLICY public_insert_inquiries
    ON inquiries FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        status = 'new'
    );


-- ============================================================================
-- 浏览量/下载量 +1 的 RPC 函数
-- ============================================================================
CREATE OR REPLACE FUNCTION public.increment_product_view_count(p_product_id BIGINT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE products
    SET view_count = view_count + 1
    WHERE id = p_product_id
      AND status = 'published';
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_product_view_count(BIGINT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.increment_article_view_count(p_article_id BIGINT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE articles
    SET view_count = view_count + 1
    WHERE id = p_article_id
      AND status = 'published';
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_article_view_count(BIGINT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.increment_document_download_count(p_document_id BIGINT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE documents
    SET download_count = download_count + 1
    WHERE id = p_document_id
      AND published_at IS NOT NULL AND published_at <= now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_document_download_count(BIGINT) TO anon, authenticated;


-- ============================================================================
-- 验证
-- ----------------------------------------------------------------------------
-- 1) 确认 inquiries 上现在只有一条 policy,且是 INSERT:
--      select policyname, cmd from pg_policies
--      where schemaname = 'public' and tablename = 'inquiries';
--    应该只看到 public_insert_inquiries 这一条(cmd = INSERT)。如果还看到
--    public_read_inquery 或 public_select_inquiries,说明上一次执行被回滚了,
--    没生效,重新跑一次这份脚本。
--
-- 2) 模拟匿名前端访客:
--      set role anon;
--      select count(*) from products;   -- 只应看到 status='published' 的行
--      select count(*) from admin_users; -- 应该报错 permission denied 或 0 行
--      select count(*) from inquiries;   -- 应该是 0(没有 SELECT policy)
--      insert into inquiries (name, email, message, status)
--          values ('测试', 'a@b.com', '测试留言', 'new');  -- 应该成功
--      select count(*) from inquiries;   -- 插入后仍然是 0,因为 anon 读不到
--      reset role;
--
-- 3) 后台不需要在这里额外验证 —— 只要后台代码用的是 service_role key
--    (确认不是不小心用了 anon/authenticated 的 key),它对所有表天然是
--    全权限,完全不受以上任何 policy 影响。
-- ============================================================================
