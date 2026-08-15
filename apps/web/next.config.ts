import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "**",
        protocol: "https"
      }
    ]
  },

  // 静态资源缓存策略：目标是让 Cloudflare 边缘节点(以及浏览器本身)尽量长时间
  // 缓存这些文件，减少每次访问都要回源，对大陆访客这种链路本来就不稳定的场景
  // 尤其有意义——命中边缘缓存的请求根本不需要再跨境回源。
  //
  // - /_next/static/**：Next.js 构建产物，文件名带内容 hash，内容变了文件名
  //   就变，所以可以放心用 immutable + 一年不过期。
  // - /icons/** (对应 public/icons)：logo、二维码示例图等静态资源，基本不变，
  //   同样给长缓存；如果以后替换了同名文件，记得改文件名或加查询参数，
  //   不然缓存不会主动失效。
  // - /_next/image：Next.js 图片优化接口的输出(产品图裁剪/转码后的结果)，
  //   给 1 天的缓存，兼顾"命中缓存快"和"后台改图后不会等太久才更新"。
  async headers() {
    return [
      {
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" }
        ],
        source: "/_next/static/:path*"
      },
      {
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" }
        ],
        source: "/icons/:path*"
      },
      {
        headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
        source: "/_next/image"
      }
    ];
  }
};

export default nextConfig;
