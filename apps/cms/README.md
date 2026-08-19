# CMS App

后台管理系统，部署为独立的 Cloudflare Worker。

## Responsibilities

- 管理员登录。
- 内容创建、编辑、发布。
- 媒体上传。
- 分类、标签、页面、导航管理。
- 调用 Supabase Postgres。
- 上传图片和资料到 Cloudflare R2，并把公开 URL 写回数据库。

## Deployment

```text
Cloudflare Worker Root Directory: apps/cms
Suggested Domain: cms.yourdomain.com
```

## Environment Variables

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CMS_SESSION_SECRET=

R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_BASE_URL=
```
