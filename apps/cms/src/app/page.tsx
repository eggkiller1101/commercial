import Link from "next/link";
import { LockKeyhole, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-3xl font-semibold tracking-normal">
          企业后台管理
        </h1>

        <form className="space-y-4">
          <label className="relative block">
            <span className="sr-only">账号</span>
            <UserRound
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input className="pl-10 text-center" placeholder="账号" />
          </label>

          <label className="relative block">
            <span className="sr-only">密码</span>
            <LockKeyhole
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              className="pl-10 text-center"
              placeholder="密码"
              type="password"
            />
          </label>

          <Button asChild className="w-full">
            <Link href="/dashboard">登录</Link>
          </Button>
        </form>
      </section>
    </main>
  );
}
