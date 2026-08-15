import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

import { requireApiPermission } from "@/features/auth/guards";

// ----------------------------------------------------------------------------
// 文件上传接口：产品图片 / 资料文档共用同一个 R2 桶 (PRODUCT_ASSETS)，用不同的
// 目录前缀区分 (products/ 和 documents/)。上传成功后返回一个公开可访问的 URL，
// 前端把这个 URL 存进 products.image_url / documents.file_url 就行。
//
// 部署前必须先完成两件事(这个会话没有 Cloudflare 账号权限，需要你自己在本地
// 终端用已登录的 wrangler CLI 执行，具体命令见 docs/R2_UPLOAD_SETUP.md)：
//   1. 创建 wrangler.jsonc 里声明的同名 R2 桶 (commercial-product-assets)
//   2. 给这个桶开启公开访问(r2.dev)，把拿到的 pub-xxxx.r2.dev 地址填进
//      wrangler.jsonc 的 vars.R2_PUBLIC_BASE_URL
// 这两步做完之前，本地 `wrangler dev` 用的是内置的本地 R2 模拟(能跑，但那些
// 文件只存在本地、重启会清空)，线上部署则会直接报错，属于预期行为。
// ----------------------------------------------------------------------------

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf"
]);
const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20MB，图片/PDF资料够用，视频等大文件不建议走这个接口

type UploadKind = "products" | "documents";

function extensionFor(file: File): string {
  const fromName = file.name.split(".").pop();
  if (fromName && fromName.length <= 5) {
    return fromName.toLowerCase();
  }

  const byType: Record<string, string> = {
    "application/pdf": "pdf",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp"
  };

  return byType[file.type] ?? "bin";
}

export async function POST(request: Request) {
  const permission = await requireApiPermission("manage_content");

  if (permission.response) {
    return permission.response;
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const kindRaw = String(formData.get("kind") ?? "products");
  const kind: UploadKind = kindRaw === "documents" ? "documents" : "products";

  if (!(file instanceof File)) {
    return NextResponse.json({ message: "请选择要上传的文件", ok: false }, { status: 400 });
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      { message: "只支持 jpeg / png / webp / pdf 格式", ok: false },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { message: "文件超过 20MB 限制", ok: false },
      { status: 400 }
    );
  }

  const { env } = await getCloudflareContext();

  const publicBaseUrl = env.R2_PUBLIC_BASE_URL?.trim();

  if (!publicBaseUrl) {
    return NextResponse.json(
      {
        message:
          "R2_PUBLIC_BASE_URL 还没配置，请先在 wrangler.jsonc 里填入桶的公开访问地址（见 docs/R2_UPLOAD_SETUP.md）",
        ok: false
      },
      { status: 500 }
    );
  }

  const key = `${kind}/${crypto.randomUUID()}.${extensionFor(file)}`;

  await env.PRODUCT_ASSETS.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type }
  });

  const url = `${publicBaseUrl.replace(/\/$/, "")}/${key}`;

  return NextResponse.json({ ok: true, url }, { status: 201 });
}
