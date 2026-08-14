# 公司网站静态原型（prototype/）

这是云工智上（北京）科技有限公司公司网站的静态原型：纯 HTML + CSS + 原生 JS，
不依赖构建工具，方便先确认设计和交互方向，再决定要不要正式迁移进 Next.js 工程
（仓库里 `apps/cms` 已经是 Next.js 15 + Tailwind + Supabase 的技术栈，
后续把这套原型迁移过去，页面结构和 `data-service.js` 里的查询逻辑基本可以直接复用）。

站点信息架构参照"网站原型图 2.pdf"确认，当前共 11 个页面。

## 页面清单

| 页面 | 文件 | 说明 |
|---|---|---|
| 首页 | `index.html` | 公司介绍、视频占位区、主推产品、联系我们 CTA |
| 产品中心 | `products.html` | 顶部分类树状图总览 + 左侧分类树 + 技术参数筛选 + 搜索 + 排序 + 分页 |
| 分类落地页 | `category.html?slug=xxx` | 大类介绍 + 子分类卡片 + 重点推荐产品 |
| 产品详情页 | `product.html?slug=xxx` | 图库、技术参数表、规格型号(SKU)、资料下载、加入询价清单、单品直接询价 |
| **询价清单** | `quote-cart.html` | 购物车式清单（数量/删除）+ 图纸上传区(静态) + 项目信息表单 + 提交后 4 步说明 |
| **联系我们** | `contact.html` | 联系渠道卡片 + 通用项目咨询表单（无需具体产品）+ 办公信息 + FAQ |
| 行业应用 | `industries.html` | 商旅交通建筑 / 能源核心场景 / 通用工业与市政基建 / 海外 EPC 四大场景 |
| 技术与服务 | `services.html` | 四项核心服务能力 + 标准服务流程 5 步 |
| 项目案例 | `cases.html` | 按行业场景筛选的代表性项目案例卡片 |
| 资料中心 | `resources.html` | 汇总所有产品的技术文档，按类型筛选 |
| 关于我们 | `about.html` | 完整公司介绍 + 发展历程时间线 + 合规资质墙 |

产品搜索结果直接复用 `products.html`（带 `?q=关键词` 会在结果区顶部显示"为你找到 N 条结果"提示条），
没有另建一个独立的搜索结果页——这样搜索结果天然继承分类筛选/排序/分页能力，逻辑更统一。

## 询价清单（购物车）系统怎么运作

这是本轮更新的核心功能，围绕"询价按钮和询价页是重要功能"这个要求设计：

- `js/quote-cart.js`：核心模块，用浏览器 `localStorage` 保存清单（key: `cloudintel_quote_cart_v1`），
  提供 `addItem/removeItem/updateQuantity/clear/count/onChange` 等接口。用 localStorage 是因为
  这是一个会被真实部署、多页面跳转的站点，"跨页面记住用户选了哪些产品"是刚需，跟 Claude.ai 里
  一次性 artifact 的场景不一样。
- 全站所有产品卡片（首页主推产品 / 产品中心列表 / 分类页重点推荐 / 详情页）都有"+ 加入清单"按钮，
  点击后不会跳转，而是把产品塞进清单并弹出右上角提示（`UI.toast()`），页头"上传清单询价"按钮上的
  数字徽标会实时更新（`UI.updateCartBadge()`，监听 `QuoteCart.onChange`）。
- `quote-cart.html` 是清单页：可以调整数量、移除单项、填写项目与联系人信息、提交。
- 提交时调用 `QuoteCart.submit()`，因为当前 `schema.sql` 的 `inquiries` 表是"单产品"模型
  （`product_id` 单个字段），这里把清单里的每一项整理成文字拼进 `message` 字段，`product_id`
  取清单第一项——**这是一个已知的简化**，正式上线前建议给 `inquiries` 表加一张
  `inquiry_items(inquiry_id, product_id, quantity)` 关联表来正规化存储多产品询价。
- 产品详情页保留了原来的"直接提交询价"单产品表单，跟"加入清单"是两条并行路径，
  分别对应"确定要哪个型号，直接问价"和"先攒几个型号，一起问价"两种用户习惯。
- `contact.html` 的通用咨询表单同样调用 `DataService.submitInquiry()`，只是 `productId` 传 `null`，
  用于承接"还没确定具体产品，只想先咨询方案"的场景。

## 产品中心的分类树状图

`products.html` 顶部的"产品分类总览"是一个纯 CSS 实现的组织架构图（`.org-tree`），数据来自
`DataService.getCategoryTreeWithCounts()`——在原有 `getCategoryTree()` 基础上，对每个分类节点
统计挂载的产品数量（大类 = 自己 + 子类之和，子类 = 直接挂载数量）。点击任意节点会跳转到对应的
分类页 / 筛选后的产品列表，颜色区分层级（根节点深色、大类描边、子类浅色），空子类会用虚线框标出。

## 怎么在本地打开

不能直接双击用 `file://` 打开 —— 页面用了 ES 的 fetch / URLSearchParams 等，
在 `file://` 协议下会被浏览器的安全策略限制。请起一个本地静态服务器，例如：

```bash
cd prototype
python3 -m http.server 8080
# 然后打开 http://localhost:8080/index.html
```

或者用 Node：`npx serve .`

## 目录结构

```
prototype/
  index.html / products.html / category.html / product.html
  quote-cart.html / contact.html
  industries.html / services.html / cases.html / resources.html / about.html
  css/
    base.css          设计令牌（颜色/字体/间距变量）
    layout.css        页头 / 页脚 / 面包屑 / 顶部导航 / 搜索框 / 购物车徽标
    components.css     按钮/卡片/筛选器/表格/表单/树状图/清单/联系卡片等可复用组件
    pages.css          各页面少量专属样式（首页各区块）
  js/
    config.js          唯一需要手动填的文件（Supabase 项目地址 + anon key）
    mock-data.js        内嵌模拟数据，字段结构对齐 schema.sql
    data-service.js      数据访问层：模拟数据 / 真实 Supabase 二选一，页面代码不用关心
    quote-cart.js         询价清单（购物车）模块，localStorage 存储
    i18n.js               中/英双语切换模块（页面 chrome + 首页文案）
    ui-common.js          页头/页脚/面包屑/搜索框/购物车徽标/toast 提示等公共 UI
    home-page.js / products-page.js / category-page.js / product-page.js
    quote-cart-page.js / contact-page.js
    industries-page.js / services-page.js / cases-page.js / resources-page.js / about-page.js
  assets/icons/         手绘 SVG 线框图标（不是真实产品图，仅用于原型阶段）
  assets/hero-bg.svg    首页 Hero 背景插画（原创 SVG，无版权风险）
```

## 中 / 英双语切换

`js/i18n.js` 是一个极简的双语模块：字典存在 `dict.zh` / `dict.en` 两个对象里，页面元素用
`data-i18n="key"`（替换 `textContent`）或 `data-i18n-html="key"`（替换 `innerHTML`，用于带
`<strong>` 的文案）标记翻译点，`data-i18n-placeholder="key"` 用于 `<input placeholder>`。
右上角语言按钮点击后把语言存进 `localStorage`（`cloudintel_site_lang`）并刷新页面——用刷新
而不是原地重渲染，是因为产品列表/树状图这些内容是各页面自己异步渲染的，刷新能保证它们也用
统一的语言重新走一遍渲染逻辑，比给每个页面脚本都加"语言变化监听"要简单可靠。

**当前覆盖范围**：页头（导航/搜索框/购物车按钮/顶部工具条）、页脚（全部栏目）、数据来源
提示条，以及首页的完整营销文案（Hero / 公司介绍 / 视频区标题 / 主推产品标题 / 联系我们）。
**已知限制**：产品名称/描述等来自数据库的内容不翻译——`schema.sql` 里
`products`/`categories` 表没有 `_en` 字段，要支持产品级双语需要加字段或建 `translations` 表；
产品中心/分类页/详情页/资料中心等页面目前只有页头页脚跟着切换，正文仍是中文，可以用同样的
`data-i18n` 模式逐页扩展。

## 数据是怎么接起来的（重点，方便理解架构）

所有页面都不直接读数据，而是调用 `js/data-service.js` 里导出的函数
（`getCategoryTree` / `getCategoryTreeWithCounts` / `getProducts` / `getProductBySlug` /
`getAllDocuments` / `submitInquiry` ...）。这一层内部会判断：

- `js/config.js` 里 `SUPABASE_URL` 和 `SUPABASE_ANON_KEY` 都留空 → 走
  `js/mock-data.js` 的内嵌模拟数据。
- 两个值都填了 → 用 `supabase-js`（CDN 引入）直接查询 Supabase 项目，
  查询语句已经按 `schema.sql` 的表结构和 `policy.sql` 的 RLS 策略写好了。

页面顶部那条橙色提示条会告诉你"当前看到的是模拟数据还是真实数据"，方便调试时判断。

## 已接入真实 Supabase

`js/config.js` 现在已经填好了真实项目地址（`https://vaegjsshjxzczjsgxgys.supabase.co`）和
`anon` / `publishable` key——这是 Supabase 新版的 `sb_publishable_...` 格式 key，跟旧版
`eyJ...` 格式的 anon JWT key 作用完全一样，都是"可以公开写在前端代码里"的公开密钥，权限
由 `policy.sql` 的 RLS 策略决定，**不是** `service_role` key。

已核对过仓库根目录的 `schema.sql` / `policy.sql`，`data-service.js` 里所有查询用到的表
（`categories` / `products` / `product_images` / `attribute_definitions` /
`product_attribute_values` / `product_variants` / `documents` / `product_documents` /
`inquiries`）和字段名都能对上，anon 角色的 SELECT / INSERT 权限范围也符合预期。

**这里有一个环境限制需要说明**：这个云端工作环境的出站网络是白名单制的，访问不了
`*.supabase.co` 或 CDN 上的 `supabase-js` 脚本，所以我没法在这个沙盒里直接打开页面验证
真实数据到底渲染成什么样（用 `curl` 直接测也被同样的网络策略拦截了）。代码层面（表结构、
字段名、RLS 策略）已经核对一致，理论上你在自己电脑/浏览器打开站点时会自动切换成"实时数据"
并显示 Supabase 里的真实产品——但如果分类/产品列表是空的，或者某个字段显示不对，麻烦告诉我
具体现象（比如"产品列表是空的"或"某个产品缺图"），我再针对性地调整 `data-service.js` 或者
帮你检查 Supabase 里的数据是否已经按 `schema.sql` / `sample_data.sql` 的格式录入。

询价表单用的是 anon key 的 INSERT 权限，对应 `policy.sql` 里专门为 `inquiries` 表开的
`public_insert_inquiries` 策略——访客提交后数据会进 `inquiries` 表，后台 CMS
（`apps/cms/dashboard/inquiries`）就能看到，不需要额外打通。

## 已知的简化 / 下一步可以做的事

- **多产品询价的数据结构**：如上文"询价清单系统"一节所述，目前把清单打包进单条 `inquiries.message`
  文本字段，建议后续加 `inquiry_items` 关联表做正规化存储。
- **图纸/清单上传**：`quote-cart.html` 的上传区目前是纯静态展示（`disabled` 的 file input），
  没有真实的文件存储后端；正式上线需要接入对象存储（如 Supabase Storage）。
- **项目案例数据**：`cases.html` 里的案例是"代表性场景说明"，不是真实项目名称/客户信息，
  内嵌在 `js/cases-page.js` 里；`schema.sql` 目前也没有 `project_cases` 表，等有真实、
  可公开的案例数据后再建表接入。
- **图片**：产品图仍是几个手绘 SVG 占位图标（`assets/icons/`），等有实拍图/工程图后替换
  `mock-data.js` 里的 `image_url`，或在 Supabase `product_images` 表里挂真实图片 URL，
  页面代码不用改。
- **移动端导航**：窄屏（≤960px）下顶部导航栏目前直接隐藏，还没做汉堡菜单。
- **筛选下推数据库**：现在是"整表拉回浏览器再筛选"，产品数量少时没问题；等产品数量涨到
  成百上千，应该把筛选条件改成 Supabase 的链式查询条件，或写一个 Postgres 函数在数据库端
  筛选分页。
- **迁移到 Next.js**：可以在 `apps/web` 建一个新的 Next.js 应用，把这里的 HTML 拆成组件、
  `data-service.js` / `quote-cart.js` 的逻辑搬到 Server Component / Server Action 或
  Context 里，CSS 变量可以原样搬进 `tailwind.config.ts` 的 theme.extend.colors。
