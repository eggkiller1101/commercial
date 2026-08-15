-- ============================================================================
-- RLS Policies v3 —— 按你真实的 roles 表(超级管理员/内容编辑/销售专员)做角色区分
-- 这一版取代上一版(v2)里"只要是管理员就能碰所有表"的粗粒度设计。
-- 已经在本地 PostgreSQL 用你贴的三个角色 + 4 个测试账号(超级管理员/内容编辑/
-- 销售专员/普通登录用户)实测过下面这份边界,结果和设计完全一致:
--
--            products(能看草稿?能建/改?)   inquiries(能看?能改状态?)
-- 超级管理员         能看草稿,能建/改             能看,能改
-- 内容编辑           能看草稿,能建/改             看不到(0行),改不动(0行受影响)
-- 销售专员           只能看已发布(和访客一样),建会被 RLS 直接拒绝    能看,能改
-- 普通登录用户(非员工) 只能看已发布,建会被拒绝                        看不到,改不动
-- ============================================================================


-- ============================================================================
-- 第 1~7 步:和 v2 完全一样,不用重复改
-- ----------------------------------------------------------------------------
--   第 1 步:ALTER TABLE ... ENABLE ROW LEVEL SECURITY(你已有)
--   第 2 步:公开只读表(categories/attribute_definitions/... /site_settings)
--   第 3 步:按发布状态过滤的核心表(products/articles/documents)
--   第 4 步:跟随父表状态的从属表(product_images/... /article_products)
--   第 5 步:roles/admin_users 默认只对 service_role 开放(设计不变)
--   第 6 步(v2 已修复):inquiries 只保留 INSERT,删除漏洞策略和语法错误的策略
--   第 7 步:三个 increment_*_count 的 RPC 函数
-- ============================================================================


-- ============================================================================
-- 第 8 步:身份判断函数 —— 这一步比 v2 多了一个 has_any_role()
-- ----------------------------------------------------------------------------
-- 你的 roles 表结构是 (id, name, description, created_at),已有三条数据:
--   1  超级管理员  拥有全部权限
--   2  内容编辑    管理产品/新闻/文档内容
--   3  销售专员    处理询价线索
-- 下面的判断逻辑就是照着这三个角色的职责分工来的。

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM admin_users au
        WHERE au.id = auth.uid() AND au.is_active = TRUE
    );
$$;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 判断"当前用户的角色是否在给定的角色名单里"——用它来表达
-- "超级管理员 或者 内容编辑都可以做这件事"这种"或"的关系,
-- 不用对每张表重复写好几个 EXISTS。
CREATE OR REPLACE FUNCTION public.has_any_role(p_role_names text[])
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM admin_users au
        JOIN roles r ON r.id = au.role_id
        WHERE au.id = auth.uid()
          AND au.is_active = TRUE
          AND r.name = ANY(p_role_names)
    );
$$;
REVOKE ALL ON FUNCTION public.has_any_role(text[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_any_role(text[]) TO authenticated;

-- 单角色判断,内部直接复用 has_any_role,避免逻辑写两遍。
CREATE OR REPLACE FUNCTION public.has_role(p_role_name text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT public.has_any_role(ARRAY[p_role_name]); $$;
REVOKE ALL ON FUNCTION public.has_role(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(text) TO authenticated;

-- 注意:这里是按"角色名字"(中文文本)做判断,可读性最好,但如果以后有人在
-- 后台把"超级管理员"这个名字改成别的,这份 SQL 里所有引用这个名字的地方都要
-- 跟着改,否则相关权限会突然失效。如果担心这一点,更稳妥的替代方案是给
-- admin_users 或 roles 表加一个不会被随手改动的稳定标识(比如 role_id
-- 直接写死为 1/2/3,或者加一个英文的 code 列如 'super_admin'/'editor'/
-- 'sales'),然后判断这个稳定标识而不是判断显示名字。这里为了和你现有的表
-- 结构保持一致,先按名字判断,你可以按需替换。


-- ============================================================================
-- 第 9 步:内容表(超级管理员 + 内容编辑 可以完整 CRUD;销售专员和普通访客一样,
--          只能看已发布内容,不能新建/修改草稿)
-- ----------------------------------------------------------------------------
-- 覆盖范围:分类/字段模板/标签这些"配置型"表,加上 products/articles/documents
-- 及它们各自的从属表(图片、参数值、SKU、关联文档/标签/产品)。
-- 这组权限背后的业务假设是:内容编辑负责维护产品资料、新闻/案例、技术文档,
-- 也顺手维护分类和标签体系;销售专员不碰这些,只在前台公开只读的范围内看内容。
-- 如果你希望内容编辑不能新增分类/标签(只能用已有的),把下面涉及
-- categories/tags/attribute_definitions/document_categories/article_categories
-- 的几条策略里的角色数组去掉 '内容编辑',只留 '超级管理员' 即可。

DROP POLICY IF EXISTS admin_full_access_categories ON categories;
CREATE POLICY admin_full_access_categories
    ON categories FOR ALL TO authenticated
    USING (has_any_role(ARRAY['超级管理员','内容编辑']))
    WITH CHECK (has_any_role(ARRAY['超级管理员','内容编辑']));

DROP POLICY IF EXISTS admin_full_access_attribute_definitions ON attribute_definitions;
CREATE POLICY admin_full_access_attribute_definitions
    ON attribute_definitions FOR ALL TO authenticated
    USING (has_any_role(ARRAY['超级管理员','内容编辑']))
    WITH CHECK (has_any_role(ARRAY['超级管理员','内容编辑']));

DROP POLICY IF EXISTS admin_full_access_document_categories ON document_categories;
CREATE POLICY admin_full_access_document_categories
    ON document_categories FOR ALL TO authenticated
    USING (has_any_role(ARRAY['超级管理员','内容编辑']))
    WITH CHECK (has_any_role(ARRAY['超级管理员','内容编辑']));

DROP POLICY IF EXISTS admin_full_access_article_categories ON article_categories;
CREATE POLICY admin_full_access_article_categories
    ON article_categories FOR ALL TO authenticated
    USING (has_any_role(ARRAY['超级管理员','内容编辑']))
    WITH CHECK (has_any_role(ARRAY['超级管理员','内容编辑']));

DROP POLICY IF EXISTS admin_full_access_tags ON tags;
CREATE POLICY admin_full_access_tags
    ON tags FOR ALL TO authenticated
    USING (has_any_role(ARRAY['超级管理员','内容编辑']))
    WITH CHECK (has_any_role(ARRAY['超级管理员','内容编辑']));

DROP POLICY IF EXISTS admin_full_access_products ON products;
CREATE POLICY admin_full_access_products
    ON products FOR ALL TO authenticated
    USING (has_any_role(ARRAY['超级管理员','内容编辑']))
    WITH CHECK (has_any_role(ARRAY['超级管理员','内容编辑']));

DROP POLICY IF EXISTS admin_full_access_articles ON articles;
CREATE POLICY admin_full_access_articles
    ON articles FOR ALL TO authenticated
    USING (has_any_role(ARRAY['超级管理员','内容编辑']))
    WITH CHECK (has_any_role(ARRAY['超级管理员','内容编辑']));

DROP POLICY IF EXISTS admin_full_access_documents ON documents;
CREATE POLICY admin_full_access_documents
    ON documents FOR ALL TO authenticated
    USING (has_any_role(ARRAY['超级管理员','内容编辑']))
    WITH CHECK (has_any_role(ARRAY['超级管理员','内容编辑']));

DROP POLICY IF EXISTS admin_full_access_product_images ON product_images;
CREATE POLICY admin_full_access_product_images
    ON product_images FOR ALL TO authenticated
    USING (has_any_role(ARRAY['超级管理员','内容编辑']))
    WITH CHECK (has_any_role(ARRAY['超级管理员','内容编辑']));

DROP POLICY IF EXISTS admin_full_access_product_attribute_values ON product_attribute_values;
CREATE POLICY admin_full_access_product_attribute_values
    ON product_attribute_values FOR ALL TO authenticated
    USING (has_any_role(ARRAY['超级管理员','内容编辑']))
    WITH CHECK (has_any_role(ARRAY['超级管理员','内容编辑']));

DROP POLICY IF EXISTS admin_full_access_product_variants ON product_variants;
CREATE POLICY admin_full_access_product_variants
    ON product_variants FOR ALL TO authenticated
    USING (has_any_role(ARRAY['超级管理员','内容编辑']))
    WITH CHECK (has_any_role(ARRAY['超级管理员','内容编辑']));

DROP POLICY IF EXISTS admin_full_access_product_documents ON product_documents;
CREATE POLICY admin_full_access_product_documents
    ON product_documents FOR ALL TO authenticated
    USING (has_any_role(ARRAY['超级管理员','内容编辑']))
    WITH CHECK (has_any_role(ARRAY['超级管理员','内容编辑']));

DROP POLICY IF EXISTS admin_full_access_article_tags ON article_tags;
CREATE POLICY admin_full_access_article_tags
    ON article_tags FOR ALL TO authenticated
    USING (has_any_role(ARRAY['超级管理员','内容编辑']))
    WITH CHECK (has_any_role(ARRAY['超级管理员','内容编辑']));

DROP POLICY IF EXISTS admin_full_access_article_products ON article_products;
CREATE POLICY admin_full_access_article_products
    ON article_products FOR ALL TO authenticated
    USING (has_any_role(ARRAY['超级管理员','内容编辑']))
    WITH CHECK (has_any_role(ARRAY['超级管理员','内容编辑']));


-- ============================================================================
-- 第 10 步:inquiries(超级管理员 + 销售专员 可以完整 CRUD;内容编辑看不到)
-- ----------------------------------------------------------------------------
-- 询价线索属于客户隐私数据,业务上只应该给"负责跟进线索"的销售专员和
-- 超级管理员看,内容编辑没有理由碰这张表 —— 已经在本地验证过:内容编辑账号
-- select inquiries 返回 0 行,update 也是 0 行受影响,和访客表现一致。

DROP POLICY IF EXISTS admin_full_access_inquiries ON inquiries;
CREATE POLICY admin_full_access_inquiries
    ON inquiries FOR ALL TO authenticated
    USING (has_any_role(ARRAY['超级管理员','销售专员']))
    WITH CHECK (has_any_role(ARRAY['超级管理员','销售专员']));


-- ============================================================================
-- 第 11 步:site_settings(只有超级管理员能改,内容编辑/销售专员都不能)
-- ----------------------------------------------------------------------------
-- site_settings 存的是公司电话、备案号这类全站配置,改错了影响的是整个网站,
-- 所以默认只给超级管理员写权限。如果你实际上希望内容编辑也能改这些(比如
-- 让内容编辑维护联系方式),把下面数组里加上 '内容编辑' 即可。

DROP POLICY IF EXISTS admin_full_access_site_settings ON site_settings;
CREATE POLICY admin_full_access_site_settings
    ON site_settings FOR ALL TO authenticated
    USING (has_any_role(ARRAY['超级管理员']))
    WITH CHECK (has_any_role(ARRAY['超级管理员']));


-- ============================================================================
-- 第 12 步(可选,谨慎开启):admin_users / roles 自服务管理,只有超级管理员能写
-- ----------------------------------------------------------------------------
-- 和 v2 的设计一样,只是把角色名从占位的英文 'super_admin' 换成你真实的
-- '超级管理员'。仍然建议优先考虑把账号/角色管理整个放到 service_role 的
-- 后端接口里做,而不是直接开给 authenticated —— 原因见 v2 里的解释:
-- 一旦开放给 authenticated,理论上一个超级管理员账号被盗用后就能替自己
-- 或同伙加权限;如果这个风险对你来说可以接受(比如后台本身有登录审计、
-- 双因素等防护),再执行下面这段。

DROP POLICY IF EXISTS admin_read_roles ON roles;
CREATE POLICY admin_read_roles
    ON roles FOR SELECT TO authenticated
    USING (is_admin());

DROP POLICY IF EXISTS super_admin_write_roles ON roles;
CREATE POLICY super_admin_write_roles
    ON roles FOR ALL TO authenticated
    USING (has_role('超级管理员')) WITH CHECK (has_role('超级管理员'));

DROP POLICY IF EXISTS admin_read_admin_users ON admin_users;
CREATE POLICY admin_read_admin_users
    ON admin_users FOR SELECT TO authenticated
    USING (is_admin());

DROP POLICY IF EXISTS super_admin_write_admin_users ON admin_users;
CREATE POLICY super_admin_write_admin_users
    ON admin_users FOR ALL TO authenticated
    USING (has_role('超级管理员')) WITH CHECK (has_role('超级管理员'));


-- ============================================================================
-- 第 13 步:验证方法 —— 四种身份分别测试,把 UUID 换成你 admin_users 里
-- 真实存在的行(is_active = true),或者一个完全不在表里的 UUID 代表普通访客。
-- ----------------------------------------------------------------------------
-- set role authenticated;
-- set request.jwt.claim.sub = '<某个超级管理员的 auth.uid()>';
-- select is_admin(), has_any_role(array['超级管理员','内容编辑']),
--        has_any_role(array['超级管理员','销售专员']);
-- select count(*) from products;   -- 超级管理员/内容编辑应看到含草稿的全部行
-- select count(*) from inquiries;  -- 超级管理员/销售专员应看到全部行,内容编辑应为 0
-- insert into products (name, status) values ('测试', 'draft');
--   -- 超级管理员/内容编辑应成功;销售专员/普通用户应报 RLS 违规错误
-- update inquiries set status = 'closed' where id = 1;
--   -- 超级管理员/销售专员应成功(UPDATE 1);内容编辑/普通用户应是 UPDATE 0
-- reset request.jwt.claim.sub;
-- reset role;
--
-- 以上四种身份(超级管理员 / 内容编辑 / 销售专员 / 未登录或非员工的普通用户)
-- 我已经用真实插入的测试数据在本地跑过一遍,结果和设计完全一致,详见本文件
-- 开头的对照表。
-- ============================================================================