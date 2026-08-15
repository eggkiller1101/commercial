# R2 图片/文件上传 —— 部署前需要你手动做的事

这份文档只覆盖"这个 Claude 会话没有权限做、必须由你在自己电脑上执行"的步骤。
代码这边（R2 绑定声明、上传接口 `apps/cms/src/app/api/upload/route.ts`、
`DocumentForm` 的实际调用）已经写好并且 `npm run build:cms` / `npm run build:web`
都验证过能编译通过。

## 为什么需要你自己操作

Cloudflare 账号/R2 桶是你们账号下的资源，这个云端沙盒环境没有你的 Cloudflare
凭证，也连不上 Cloudflare 的 API（网络白名单限制），所以创建桶这件事必须在你
自己的电脑上、用已经登录过的 `wrangler` CLI 来做（`apps/cms` 现有的部署流程
已经证明你本地是有 wrangler 登录态的）。

## 步骤

1. 在 `apps/cms` 目录下创建 R2 桶（桶名跟 `wrangler.jsonc` 里 `r2_buckets` 声明
   的 `bucket_name` 必须完全一致）：

   ```bash
   cd apps/cms
   npx wrangler r2 bucket create commercial-product-assets
   ```

2. 给这个桶开启公开访问（这样上传后生成的图片/文件链接才能被浏览器直接打开）：

   ```bash
   npx wrangler r2 bucket dev-url enable commercial-product-assets
   ```

   执行完这条命令，终端会打印一个类似
   `https://pub-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.r2.dev` 的地址——这就是这个桶
   的公开访问域名，把它记下来。

   （如果你们后面想用自己的域名而不是 `r2.dev` 这种默认域名，可以在 Cloudflare
   控制台 R2 → 这个桶 → Settings 里绑定自定义域名，绑好之后把下一步填的地址换成
   你的自定义域名就行，代码不用改。）

3. 打开 `apps/cms/wrangler.jsonc`，把上一步拿到的地址填进 `vars.R2_PUBLIC_BASE_URL`：

   ```jsonc
   "vars": {
     "R2_PUBLIC_BASE_URL": "https://pub-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.r2.dev"
   }
   ```

4. 部署 CMS（跟你们平时部署 CMS 的方式一样）：

   ```bash
   npm run deploy --workspace @commercial/cms
   ```

完成以上 4 步之后，CMS 后台的"新增资料文件"表单会真正把文件传到 R2 并把生成
的公开链接存进 `documents.file_url`；`apps/web` 那边的资料下载页会直接用这个
链接，不需要额外配置。

## 还没做的部分（如果需要请再说一声）

- **产品图片上传**：`apps/cms` 的"新增产品"表单（`product-form.tsx`）目前提交
  的字段（`productName`/`productId`/`category` 自由文本）跟真实数据库结构
  （`products.name`/`model_number`/`subcategory_id` 等）本身就对不上，也完全
  没有调用任何保存图片的逻辑——这是一个比"接上传接口"更大的问题，需要单独一次
  把整个产品表单按真实三级分类结构（`categories` → `subcategories` → `products`）
  重做。这次先把上传接口（`/api/upload`）和 R2 绑定准备好了，产品表单本身的
  重构建议单独开一个任务处理，避免这次改动范围失控。
- **本地开发（`wrangler dev` / `npm run preview`）**：在你完成上面 4 步之前，
  本地跑 `wrangler dev` 时 R2 绑定会自动落到 wrangler 内置的"本地模拟"模式
  （文件只存在本地磁盘，重启会清空，不会影响线上），可以用来先测通上传流程，
  不用等真的建好桶。
