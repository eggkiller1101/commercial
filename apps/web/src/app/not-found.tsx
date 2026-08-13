import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[24rem] max-w-3xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-semibold">页面不存在</h1>
      <p className="mt-3 text-muted-foreground">请返回首页继续浏览。</p>
      <Button asChild className="mt-6">
        <Link href="/">返回首页</Link>
      </Button>
    </div>
  );
}
