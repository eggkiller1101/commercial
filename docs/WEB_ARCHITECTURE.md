# Web Architecture Draft

这份文档给 `apps/web` 开发使用，目标是先明确前台网站和 CMS、Supabase 之间的职责边界。

## Core Rule

`apps/web` 是前台展示站，默认只读 Supabase 数据。

唯一需要写数据的场景：

- 用户提交询价表单
- 用户上传询价单文件

其他页面都只读数据，不做后台管理写入。

## App Boundary

```text
apps/cms
  管理后台
  创建、编辑、下架、发布内容
  写入 products / categories / documents / admin_users 等表

apps/web
  前台网站
  展示已发布内容
  读取 products / categories / documents 等表
  只在询价提交时写入 inquiries
```

## Suggested Directory

```text
apps/web/
  src/
    app/
      page.tsx
      layout.tsx
      globals.css

      products/
        page.tsx
        [productId]/
          page.tsx

      categories/
        [categorySlug]/
          page.tsx

      documents/
        page.tsx

      inquiry/
        page.tsx

      contact/
        page.tsx

    components/
      layout/
        site-header.tsx
        site-footer.tsx

      home/
        hero-section.tsx
        product-section.tsx

      products/
        product-card.tsx
        product-grid.tsx

      inquiry/
        inquiry-form.tsx

    features/
      products/
        data.ts

      categories/
        data.ts

      documents/
        data.ts

      inquiries/
        actions.ts

    lib/
      supabase/
        server.ts
        database.types.ts

      utils.ts

  public/
    images/
      logo.png
```

## Data Access

### Products

Web 只显示已上架产品。

```text
products.status = published
```

CMS 下架产品时会把状态改成：

```text
products.status = archived
```

所以 web 查询产品列表、产品详情时都要过滤 `published`，不要展示 `archived`。

建议接口：

```text
getPublishedProducts
getPublishedProductById
getProductsByCategory
```

### Categories

Web 读取分类用于：

- 产品导航
- 产品筛选
- 分类详情页

建议只显示启用中的分类：

```text
categories.is_active = true
```

建议接口：

```text
getActiveCategories
getCategoryBySlug
```

### Documents

Web 读取资料/文件列表，用于下载中心或产品资料。

目前文件存储还没有最终确定，后续可能接 Cloudflare R2、Supabase Storage 或其他对象存储。

建议接口：

```text
getPublishedDocuments
getDocumentById
```

### Inquiries

Web 只有询价相关功能需要写数据。

用户填写：

- 客户名
- 客户公司
- 客户电话
- 邮箱
- 产品 id
- 具体信息
- 上传询价单文件

写入目标：

```text
inquiries
```

如果询价单文件存储未接入，先不要写 mock URL。等存储方案确定后，流程应为：

```text
1. 用户选择文件
2. Web 上传文件到存储服务
3. 存储服务返回真实文件 URL 或 object key
4. Web 提交询价表单，把文件地址写入 inquiries
```

## Supabase Keys

Web 前台只需要：

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

Web 不应该使用：

```text
SUPABASE_SERVICE_ROLE_KEY
CMS_SESSION_SECRET
```

`SUPABASE_SERVICE_ROLE_KEY` 只允许 CMS server API 或后端服务使用，不能暴露给浏览器。

## RLS Direction

Web 读取 public 数据：

```text
publishable key + RLS
```

Web 提交询价：

```text
允许 anon / authenticated insert inquiries
```

或者通过受控 API 提交。

如果后续询价上传接 R2，建议由 server API 生成上传凭证或处理上传，避免把敏感密钥暴露给浏览器。

## First Milestone

第一阶段建议只做这些页面：

- 首页
- 产品列表
- 产品详情
- 分类页
- 文件下载页
- 询价页
- 联系我们

新闻、案例可以等 CMS 对应模块完成后再接入。

## Deployment

如果部署到 Cloudflare，`apps/web` 应该作为独立项目部署。

```text
Root directory: apps/web
```

CMS 和 Web 可以连接同一个 Supabase Project，但应该是两个独立部署：

```text
commercial-cms
commercial-web
```
