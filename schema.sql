-- ============================================================================
-- 网站数据库设计脚本  (参考 Victaulic 中文站的业务形态)
-- 目标数据库: PostgreSQL 14+
-- 模块: 产品目录与分类 / 技术资料下载中心 / 经销商门店查找 / 新闻资讯与案例研究
--       + 询价线索 / 后台用户 / 站点设置 (通用辅助模块)
-- 命名规范: 表名小写复数 snake_case;主键统一为 id BIGSERIAL;
--           所有表均有 created_at,可变更内容的表额外有 updated_at(触发器自动维护)
-- ============================================================================


-- ============================================================================
-- 0. 扩展插件 (extensions)
-- ============================================================================
-- pgcrypto:   生成 UUID / 加密函数(如后台用户密码哈希可选用)
-- pg_trgm:    支持模糊匹配 / LIKE 加速索引,用于产品名称、经销商名称的搜索
-- unaccent:   去除拉丁字符重音符号,多语言搜索时有用
-- cube + earthdistance: 提供经纬度距离计算,用于"附近的经销商"查询
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;


-- ============================================================================
-- 0.1 通用工具函数: 自动维护 updated_at 字段
-- ============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION set_updated_at() IS '通用触发器函数:每次 UPDATE 时自动把 updated_at 刷新为当前时间';


-- ============================================================================
-- 1. 权限与后台用户 (放在最前面,因为后面很多表会引用 admin_users)
-- ============================================================================
CREATE TABLE roles (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(50)  NOT NULL UNIQUE,   -- '超级管理员' '内容编辑' '销售专员'
    description VARCHAR(300),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE admin_users (
    id            BIGSERIAL PRIMARY KEY,
    username      VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,          -- 存 bcrypt/argon2 哈希,绝不存明文
    role_id       BIGINT REFERENCES roles(id) ON DELETE SET NULL,
    is_active     BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE admin_users IS '后台管理系统登录账号,用于内容编辑/销售线索处理等';


-- ============================================================================
-- 2. 产品目录与分类模块
-- ============================================================================

-- 2.1 分类表:自引用邻接表(adjacency list)实现树形结构
--     例如: 管道连接解决方案 > 沟槽式管路连接件 > 卡箍(Coupling)
CREATE TABLE categories (
    id               BIGSERIAL PRIMARY KEY,
    parent_id        BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    name             VARCHAR(200) NOT NULL,
    slug             VARCHAR(200) NOT NULL UNIQUE,   -- URL 友好标识,如 grooved-couplings
    description      TEXT,
    icon_url         VARCHAR(500),
    banner_image_url VARCHAR(500),
    sort_order       INTEGER NOT NULL DEFAULT 0,
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    seo_title        VARCHAR(300),
    seo_description  VARCHAR(500),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_is_active ON categories(is_active);

CREATE TRIGGER trg_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE categories IS '产品分类树,支持多级分类(产品线>系列>类别),parent_id 为空表示顶级分类';


-- 2.2 产品主表
CREATE TABLE products (
    id                   BIGSERIAL PRIMARY KEY,
    category_id          BIGINT REFERENCES categories(id) ON DELETE SET NULL,
    model_number         VARCHAR(100) NOT NULL UNIQUE,   -- 型号/款式号,如 Victaulic 的 "Style 07"
    name                 VARCHAR(300) NOT NULL,
    slug                 VARCHAR(300) NOT NULL UNIQUE,
    summary              VARCHAR(500),                    -- 列表页短描述
    description          TEXT,                             -- 详情页富文本(HTML)
    application_notes    TEXT,                             -- 适用场景/安装注意事项
    status               VARCHAR(20) NOT NULL DEFAULT 'draft'
                         CHECK (status IN ('draft','published','archived')),
    is_featured          BOOLEAN NOT NULL DEFAULT FALSE,   -- 首页/分类页是否重点推荐
    view_count           BIGINT NOT NULL DEFAULT 0,
    seo_title            VARCHAR(300),
    seo_keywords         VARCHAR(300),
    seo_description      VARCHAR(500),
    search_vector        tsvector,                         -- 全文检索用(见下方触发器)
    published_at         TIMESTAMPTZ,
    created_by           BIGINT REFERENCES admin_users(id) ON DELETE SET NULL,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_is_featured ON products(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_products_name_trgm ON products USING gin (name gin_trgm_ops);   -- 模糊搜索加速
CREATE INDEX idx_products_search_vector ON products USING gin (search_vector);

CREATE TRIGGER trg_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 简单的全文检索向量维护触发器(中文分词效果有限,详见设计文档说明)
-- CREATE OR REPLACE FUNCTION products_search_vector_update()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.search_vector :=
--         setweight(to_tsvector('simple', coalesce(NEW.name, '')), 'A') ||
--         setweight(to_tsvector('simple', coalesce(NEW.model_number, '')), 'A') ||
--         setweight(to_tsvector('simple', coalesce(NEW.summary, '')), 'B') ||
--         setweight(to_tsvector('simple', coalesce(NEW.description, '')), 'C');
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER trg_products_search_vector
--     BEFORE INSERT OR UPDATE ON products
--     FOR EACH ROW EXECUTE FUNCTION products_search_vector_update();

COMMENT ON TABLE products IS '产品主表,一个产品对应一个"产品详情页",不同规格型号放在 product_variants';


-- 2.3 产品图片(一对多,支持多图与主图标记)
CREATE TABLE product_images (
    id         BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url  VARCHAR(500) NOT NULL,
    alt_text   VARCHAR(300),
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_images_product_id ON product_images(product_id);

-- 保证每个产品最多只有一张主图
CREATE UNIQUE INDEX uq_product_images_one_primary
    ON product_images(product_id) WHERE is_primary = TRUE;

COMMENT ON TABLE product_images IS '产品图片库,is_primary 标记的是列表页/卡片展示的主图';


-- 2.4 技术参数模板 (按分类定义可筛选的规格字段,实现 EAV 灵活扩展)
--     例如"沟槽式卡箍"分类下定义: 适用管径(mm) / 额定工作压力(MPa) / 材质 / 适用标准
CREATE TABLE attribute_definitions (
    id            BIGSERIAL PRIMARY KEY,
    category_id   BIGINT REFERENCES categories(id) ON DELETE CASCADE,  -- NULL = 全局通用属性
    code          VARCHAR(100) NOT NULL,          -- 程序内部使用的字段代号,如 pipe_diameter
    name          VARCHAR(200) NOT NULL,          -- 前端展示名称,如 "适用管径"
    unit          VARCHAR(50),                     -- 如 mm / MPa / °C
    data_type     VARCHAR(20) NOT NULL DEFAULT 'text'
                  CHECK (data_type IN ('text','number','boolean','enum')),
    is_filterable BOOLEAN NOT NULL DEFAULT TRUE,   -- 是否出现在产品筛选器里
    sort_order    INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (category_id, code)
);

COMMENT ON TABLE attribute_definitions IS '技术参数字段模板,按分类定义,决定该分类下产品要采集哪些规格属性';

-- 产品的具体参数取值
CREATE TABLE product_attribute_values (
    id                       BIGSERIAL PRIMARY KEY,
    product_id               BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    attribute_definition_id  BIGINT NOT NULL REFERENCES attribute_definitions(id) ON DELETE CASCADE,
    value_text               VARCHAR(500),     -- data_type = text/enum/boolean 时使用
    value_number             NUMERIC(18,4),    -- data_type = number 时使用,便于范围筛选/排序
    UNIQUE (product_id, attribute_definition_id)
);

CREATE INDEX idx_pav_product_id ON product_attribute_values(product_id);
CREATE INDEX idx_pav_attr_def_id ON product_attribute_values(attribute_definition_id);
CREATE INDEX idx_pav_value_number ON product_attribute_values(value_number);

COMMENT ON TABLE product_attribute_values IS '产品技术参数取值表(EAV模式),支持按规格筛选产品(如管径 DN50-DN100)';


-- 2.5 产品规格型号(同一产品下不同尺寸/压力等级对应不同 SKU)
CREATE TABLE product_variants (
    id               BIGSERIAL PRIMARY KEY,
    product_id       BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku              VARCHAR(100) NOT NULL UNIQUE,
    variant_name     VARCHAR(200) NOT NULL,   -- 例如 "DN50 (2英寸) - PN16"
    extra_attributes JSONB,                    -- 灵活存放该规格特有的次要参数
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order       INTEGER NOT NULL DEFAULT 0,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_extra_attrs ON product_variants USING gin (extra_attributes);

COMMENT ON TABLE product_variants IS '产品的具体规格/型号(SKU级别),extra_attributes 用 JSONB 存放不需要跨产品筛选的次要参数';


-- ============================================================================
-- 3. 技术资料下载中心模块
-- ============================================================================

CREATE TABLE document_categories (
    id         BIGSERIAL PRIMARY KEY,
    parent_id  BIGINT REFERENCES document_categories(id) ON DELETE SET NULL,
    name       VARCHAR(200) NOT NULL,     -- 如 "产品说明书" "安装指南" "认证证书"
    slug       VARCHAR(200) NOT NULL UNIQUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE documents (
    id               BIGSERIAL PRIMARY KEY,
    category_id      BIGINT REFERENCES document_categories(id) ON DELETE SET NULL,
    title            VARCHAR(300) NOT NULL,
    file_url         VARCHAR(500) NOT NULL,     -- 建议存对象存储(OSS/S3)的URL,不要把文件存进数据库
    file_type        VARCHAR(20) NOT NULL,      -- pdf / dwg / step / docx / xlsx ...
    file_size_bytes  BIGINT,
    language         VARCHAR(10) NOT NULL DEFAULT 'zh-CN',
    version          VARCHAR(50),
    download_count   BIGINT NOT NULL DEFAULT 0,
    published_at     TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_documents_category_id ON documents(category_id);
CREATE INDEX idx_documents_file_type ON documents(file_type);

CREATE TRIGGER trg_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE documents IS '技术资料文件元信息,实际文件建议存对象存储服务,数据库只存URL和元数据';

-- 产品 <-> 文档 多对多关联(一份安装指南可能对应多个产品,一个产品也可能有多份资料)
CREATE TABLE product_documents (
    product_id  BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    document_id BIGINT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, document_id)
);

CREATE INDEX idx_product_documents_document_id ON product_documents(document_id);


-- ============================================================================
-- 5. 新闻资讯 / 案例研究模块
-- ============================================================================

CREATE TABLE article_categories (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(200) NOT NULL,
    slug       VARCHAR(200) NOT NULL UNIQUE,
    type       VARCHAR(20) NOT NULL CHECK (type IN ('news','case_study')),
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE articles (
    id               BIGSERIAL PRIMARY KEY,
    category_id      BIGINT REFERENCES article_categories(id) ON DELETE SET NULL,
    title            VARCHAR(300) NOT NULL,
    slug             VARCHAR(300) NOT NULL UNIQUE,
    summary          VARCHAR(500),
    content          TEXT,                    -- 富文本 HTML
    cover_image_url  VARCHAR(500),
    author           VARCHAR(100),
    status           VARCHAR(20) NOT NULL DEFAULT 'draft'
                     CHECK (status IN ('draft','published','archived')),
    view_count       BIGINT NOT NULL DEFAULT 0,
    seo_title        VARCHAR(300),
    seo_description  VARCHAR(500),
    search_vector    tsvector,
    published_at     TIMESTAMPTZ,
    created_by       BIGINT REFERENCES admin_users(id) ON DELETE SET NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_articles_category_id ON articles(category_id);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX idx_articles_search_vector ON articles USING gin (search_vector);

CREATE TRIGGER trg_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION articles_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('simple', coalesce(NEW.title, '')), 'A') ||
        setweight(to_tsvector('simple', coalesce(NEW.summary, '')), 'B') ||
        setweight(to_tsvector('simple', coalesce(NEW.content, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_articles_search_vector
    BEFORE INSERT OR UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION articles_search_vector_update();

COMMENT ON TABLE articles IS '新闻资讯与案例研究统一用一张表存储,通过 article_categories.type 区分';

CREATE TABLE tags (
    id   BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE article_tags (
    article_id BIGINT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    tag_id     BIGINT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, tag_id)
);

-- 案例研究关联的产品(多对多):一个案例可能用到多个产品,一个产品可能出现在多个案例中
CREATE TABLE article_products (
    article_id BIGINT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    PRIMARY KEY (article_id, product_id)
);


-- ============================================================================
-- 6. 询价 / 联系表单线索模块 (强烈建议的通用配套模块)
-- ============================================================================

CREATE TABLE inquiries (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    company     VARCHAR(300),
    phone       VARCHAR(50),
    email       VARCHAR(200),
    product_id  BIGINT REFERENCES products(id) ON DELETE SET NULL,
    message     TEXT,
    status      VARCHAR(20) NOT NULL DEFAULT 'new'
                CHECK (status IN ('new','contacted','closed')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_inquiries_status ON inquiries(status);
CREATE INDEX idx_inquiries_created_at ON inquiries(created_at DESC);

CREATE TRIGGER trg_inquiries_updated_at
    BEFORE UPDATE ON inquiries
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE inquiries IS '询价/联系表单产生的销售线索,即使前端暂未规划此功能也建议预留,几乎所有B2B站点最终都需要';


-- ============================================================================
-- 7. 站点全局设置(FOOTER)
-- ============================================================================

CREATE TABLE site_settings (
    key         VARCHAR(100) PRIMARY KEY,
    value       TEXT,
    description VARCHAR(300),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_site_settings_updated_at
    BEFORE UPDATE ON site_settings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE site_settings IS '存放全局配置项,如公司联系方式、SEO默认值、备案号等 key-value 数据';



ALTER TABLE products
    ADD CONSTRAINT products_status_check
    CHECK (status IN ('published','unpublished'));

ALTER TABLE products
    ALTER COLUMN status SET DEFAULT 'unpublished';