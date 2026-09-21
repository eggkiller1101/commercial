# Web App

前台网站，负责展示公开内容。

核心规则：

- 默认只读 Supabase 数据。
- 只有询价表单提交和询价单上传需要写数据。
- 产品只展示 `status = published`。
- CMS 下架后的 `status = unpublished` 产品，web 不展示。

详细架构见：

```text
docs/WEB_ARCHITECTURE.md
```

## Deployment

```text
Root Directory: apps/web
Project: commercial-web
```

询价附件上传到 Cloudflare R2；生产 Worker 需配置以下服务端变量：

```text
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_FILE_BUCKET=
NEXT_PUBLIC_R2_FILE_BASE_URL=
```

`R2_ACCESS_KEY_ID` 和 `R2_SECRET_ACCESS_KEY` 必须设置为 Worker secrets，不要加 `NEXT_PUBLIC_` 前缀。`NEXT_PUBLIC_R2_FILE_BASE_URL` 是文件 bucket 的公开访问地址。上传成功后，该 URL 写入 `inquiries.quote_file_url`，供 CMS 下载。
