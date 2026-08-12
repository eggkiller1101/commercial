# Supabase Integration

CMS 已经把数据读取封装在接口层：

```text
apps/cms/src/features/products/data.ts
apps/cms/src/features/inquiries/data.ts
```

页面不直接查询 Supabase。后续数据库字段调整时，优先只改这两个文件。

## Environment Variables

在 `apps/cms/.env.local` 或部署环境中配置：

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

不要把 `SUPABASE_SERVICE_ROLE_KEY` 放到浏览器端代码里。

## Products

### `getProducts({ page, pageSize })`

读取：

```sql
public.products
```

当前字段映射：

```text
products.id         -> ProductListItem.id
products.name       -> ProductListItem.name
products.created_at -> ProductListItem.uploadedAt
```

### `getProductById(productId)`

读取：

```sql
public.products
public.categories
public.product_images
```

当前字段映射：

```text
products.model_number        -> productId
products.name                -> productName
products.description         -> description
categories.name              -> category
product_images.image_url[]   -> images[]
```

支持用 `products.id` 或 `products.model_number` 查询。

## Inquiries

### `getInquiries({ page, pageSize })`

读取：

```sql
public.inquiries
```

当前字段映射：

```text
inquiries.id         -> id
inquiries.id         -> customerId, 临时格式 CUST-001
inquiries.created_at -> inquiryTime
```

当前 schema 没有客户编号字段，所以 `customerId` 暂时由 `inquiries.id` 生成。如果后端需要真实客户编号，建议增加：

```sql
customer_id varchar
```

### `getInquiryById(inquiryId)`

读取：

```sql
public.inquiries
```

当前字段映射：

```text
inquiries.name       -> customerName
inquiries.company    -> customerCompany
inquiries.phone      -> customerPhone
inquiries.email      -> email
inquiries.product_id -> productId
inquiries.message    -> message
```

## Inquiry Quote CSV

### `getInquiryQuoteCsv(inquiryId)`

当前 schema 没有上传的询价单字段，所以现在是根据询价详情动态生成 mock CSV。

如果要支持真实上传文件，后端需要补其中一种方案：

```text
方案 A: inquiries 表增加 quote_file_url
方案 B: inquiries 表增加 quote_file_path，并告知 Supabase Storage bucket
方案 C: 新增 inquiry_files 表，支持一条询价多个附件
```

推荐方案 B：

```sql
alter table public.inquiries
add column quote_file_path varchar;
```

并约定：

```text
bucket: inquiry-files
path: quote_file_path
download: 后端/API 使用 signed URL 或 stream 文件
```

## RLS Requirements

CMS 目前使用 publishable key 读取：

```text
products
categories
product_images
inquiries
```

如果这些表开启了 RLS，需要允许后台用户读取相关数据。当前还未接 Auth，因此开发阶段可以先确认 publishable key 是否能读取，后续再加后台登录和角色权限。
