# Web App

前台网站，负责展示公开内容。

核心规则：

- 默认只读 Supabase 数据。
- 只有询价表单提交和询价单上传需要写数据。
- 产品只展示 `status = published`。
- CMS 下架后的 `status = archived` 产品，web 不展示。

详细架构见：

```text
docs/WEB_ARCHITECTURE.md
```

## Deployment

```text
Root Directory: apps/web
Project: commercial-web
```
