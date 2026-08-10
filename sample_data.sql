INSERT INTO roles (name, description) VALUES
    ('超级管理员', '拥有全部权限'),
    ('内容编辑', '管理产品/新闻/文档内容'),
    ('销售专员', '处理询价线索');

INSERT INTO admin_users (username, email, password_hash, full_name, role_id) VALUES
    ('admin', 'admin@example.com', crypt('ChangeMe123!', gen_salt('bf')), '系统管理员',
     (SELECT id FROM roles WHERE name = '超级管理员'));

INSERT INTO categories (name, slug, description, sort_order) VALUES
    ('管道连接解决方案', 'pipe-joining-solutions', '机械式管道连接产品系列', 1),
    ('消防解决方案', 'fire-protection-solutions', '消防喷淋及管路系统产品系列', 2);

INSERT INTO categories (parent_id, name, slug, sort_order) VALUES
    ((SELECT id FROM categories WHERE slug = 'pipe-joining-solutions'), '沟槽式卡箍', 'grooved-couplings', 1),
    ((SELECT id FROM categories WHERE slug = 'pipe-joining-solutions'), '沟槽式管件', 'grooved-fittings', 2),
    ((SELECT id FROM categories WHERE slug = 'fire-protection-solutions'), '喷淋头', 'sprinkler-heads', 1);

INSERT INTO attribute_definitions (category_id, code, name, unit, data_type, is_filterable, sort_order) VALUES
    ((SELECT id FROM categories WHERE slug = 'grooved-couplings'), 'pipe_diameter', '适用管径', 'mm', 'number', TRUE, 1),
    ((SELECT id FROM categories WHERE slug = 'grooved-couplings'), 'rated_pressure', '额定工作压力', 'MPa', 'number', TRUE, 2),
    ((SELECT id FROM categories WHERE slug = 'grooved-couplings'), 'material', '材质', NULL, 'text', TRUE, 3);

INSERT INTO products (category_id, model_number, name, slug, summary, status, published_at) VALUES
    ((SELECT id FROM categories WHERE slug = 'grooved-couplings'), 'Style-77',
     '标准沟槽式挠性卡箍', 'style-77-flexible-coupling',
     '适用于多种管径的标准挠性沟槽式卡箍,安装快捷,密封可靠', 'published', now());

INSERT INTO product_attribute_values (product_id, attribute_definition_id, value_number) VALUES
    ((SELECT id FROM products WHERE slug = 'style-77-flexible-coupling'),
     (SELECT id FROM attribute_definitions WHERE code = 'pipe_diameter' AND category_id = (SELECT id FROM categories WHERE slug = 'grooved-couplings')),
     100);

INSERT INTO document_categories (name, slug, sort_order) VALUES
    ('产品说明书', 'product-manuals', 1),
    ('安装指南', 'installation-guides', 2),
    ('认证证书', 'certifications', 3);

INSERT INTO documents (category_id, title, file_url, file_type, language, published_at) VALUES
    ((SELECT id FROM document_categories WHERE slug = 'installation-guides'),
     'Style 77 卡箍安装指南', 'https://cdn.example.com/docs/style-77-install-guide.pdf', 'pdf', 'zh-CN', now());

INSERT INTO product_documents (product_id, document_id)
    SELECT
        (SELECT id FROM products WHERE slug = 'style-77-flexible-coupling'),
        (SELECT id FROM documents WHERE title = 'Style 77 卡箍安装指南');

INSERT INTO article_categories (name, slug, type, sort_order) VALUES
    ('公司新闻', 'company-news', 'news', 1),
    ('工程案例', 'engineering-case-studies', 'case_study', 2);

INSERT INTO articles (category_id, title, slug, summary, status, published_at) VALUES
    ((SELECT id FROM article_categories WHERE slug = 'engineering-case-studies'),
     '某数据中心消防管路系统升级案例', 'data-center-fire-protection-upgrade-case',
     '采用沟槽式连接技术缩短项目工期30%', 'published', now());

INSERT INTO site_settings (key, value, description) VALUES
    ('company_name', 'XX管道科技(上海)有限公司', '公司全称,用于页脚/关于我们'),
    ('service_hotline', '400-000-0000', '客服热线');
