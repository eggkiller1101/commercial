// 给 @opennextjs/cloudflare 的全局 CloudflareEnv 接口做声明合并，
// 这样 getCloudflareContext().env 就能带上下面这些绑定/变量的类型，
// 不用在每个用到的地方都手写泛型参数。
// 实际绑定内容以 wrangler.jsonc 里的 r2_buckets / vars 为准。
//
// 特意不引入 @cloudflare/workers-types 这个包：它会全局重定义 Response /
// ReadableStream 等和浏览器 DOM lib 同名但不完全兼容的类型，跟这个项目里
// 浏览器端代码(比如 quote-download-button.tsx 用到的 document.body.append())
// 会冲突。这里只手写上传接口实际用到的那几个 R2Bucket 方法签名，够用就行，
// 不需要引入整个 Workers 运行时的类型定义。
interface MinimalR2Bucket {
  put(
    key: string,
    value: ArrayBuffer | ArrayBufferView | string | ReadableStream | Blob,
    options?: {
      httpMetadata?: {
        contentType?: string;
      };
    }
  ): Promise<unknown>;
}

interface CloudflareEnv {
  PRODUCT_ASSETS: MinimalR2Bucket;
  R2_PUBLIC_BASE_URL: string;
}
