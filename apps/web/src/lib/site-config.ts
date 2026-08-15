// 站点级静态信息，跟 demo 静态站 js/config.js 里的 window.APP_CONFIG 保持一致，
// 只是这里是给 Next.js（服务端 + 客户端组件都能 import）用的普通 TS 常量。
export const SITE_CONFIG = {
  SITE_NAME: "云工智上",
  SITE_NAME_FULL: "云工智上（北京）科技有限公司",
  SITE_NAME_EN: "CloudIntel Works (Beijing) Technology Co., Ltd.",
  SERVICE_HOTLINE: "400-000-0000",
  SERVICE_EMAIL: "sales@cloudintelworks.com",
  WECHAT_LABEL: "扫码添加工程师"
} as const;
