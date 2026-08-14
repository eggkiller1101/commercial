/**
 * config.js
 * ----------------------------------------------------------------------------
 * 这是唯一一个"接真实 Supabase"时需要你手动填的文件。
 *
 * 两个值都来自 Supabase 项目后台 → Project Settings → API：
 *   - SUPABASE_URL：形如 https://xxxxxxxx.supabase.co
 *   - SUPABASE_ANON_KEY：Project API keys 里的 "anon / public" key
 *     （不是 service_role key！service_role key 绝对不能出现在浏览器代码里，
 *      这一点 apps/cms 的 .env.example 里也特别强调过。）
 *
 * anon key 本身设计上就是"公开的"——它能查到什么数据完全由 Supabase 的
 * Row Level Security (RLS) 策略决定（参考仓库根目录 policy.sql）。
 * 所以把它写死在这个前端文件里是安全的、也是 Supabase 官方推荐的用法。
 *
 * 两个值任意一个留空，整个原型会自动切换到 js/mock-data.js 里的模拟数据，
 * 页面照样能完整跑起来，方便你在还没配置数据库之前先看设计效果。
 */
window.APP_CONFIG = {
  SUPABASE_URL: "https://vaegjsshjxzczjsgxgys.supabase.co",
  // 注意：这是 Supabase 新版 "publishable" key（sb_publishable_... 格式），
  // 跟旧版 anon JWT key（eyJ... 格式）作用完全一样——都是"可以公开写在前端代码里"
  // 的公开密钥，权限由 RLS policy（policy.sql）决定，绝不是 service_role key。
  SUPABASE_ANON_KEY: "sb_publishable_V1izlccxClkfSLqgnJF4LA_WapAe2yw",

  // 每页展示多少个产品卡片，对应 CMS getProducts({ page, pageSize }) 的 pageSize
  PRODUCT_PAGE_SIZE: 8,

  // 公司名称：取自《云工智上简介.pdf》。上一版原型误用了"云工智联"这个名字
  // （来自品牌色板文件名），这里已按公司简介 PDF 统一改回"云工智上"，
  // 英文名按你的要求更新为 CloudIntel Works (Beijing) Technology Co., Ltd.
  SITE_NAME: "云工智上",
  SITE_NAME_FULL: "云工智上（北京）科技有限公司",
  SITE_NAME_EN: "CloudIntel Works (Beijing) Technology Co., Ltd.",
  SERVICE_HOTLINE: "400-000-0000",
  // 联系我们页 + 页脚"联系方式"栏共用同一个值，改这里两处会自动同步，
  // 不用两个地方分别改。
  SERVICE_EMAIL: "sales@cloudintelworks.com",

  // 首页"公司介绍视频"区块用。两个都留空时，页面会显示一个占位区，
  // 不会报错；等有实拍视频后，把视频文件（或视频 CDN 直链）地址填到
  // INTRO_VIDEO_URL，海报图填到 INTRO_VIDEO_POSTER 即可自动切换成真实播放器。
  INTRO_VIDEO_URL: "",
  INTRO_VIDEO_POSTER: ""
};
