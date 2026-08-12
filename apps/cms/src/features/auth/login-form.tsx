"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LoginErrors = Partial<Record<"password" | "username" | "form", string>>;

export function LoginForm() {
  const router = useRouter();
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function clearError(field: keyof LoginErrors) {
    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      delete nextErrors.form;
      return nextErrors;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");
    const nextErrors: LoginErrors = {};

    if (!username) {
      nextErrors.username = "请输入账号";
    }

    if (!password) {
      nextErrors.password = "请输入密码";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        body: JSON.stringify({ password, username }),
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST"
      });
      const result = (await response.json()) as {
        message?: string;
        ok?: boolean;
      };

      if (!response.ok || !result.ok) {
        setErrors({
          form: result.message ?? "登录失败，请稍后重试"
        });
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setErrors({
        form: "登录失败，请稍后重试"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <section className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-3xl font-semibold tracking-normal">
          企业后台管理
        </h1>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="relative block">
            <span className="sr-only">账号</span>
            <UserRound
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-5 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              className="pl-10 text-center"
              disabled={isSubmitting}
              name="username"
              onChange={() => clearError("username")}
              placeholder="账号"
            />
            {errors.username ? (
              <span className="mt-1 block text-xs text-destructive">
                {errors.username}
              </span>
            ) : null}
          </label>

          <label className="relative block">
            <span className="sr-only">密码</span>
            <LockKeyhole
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-5 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              className="pl-10 text-center"
              disabled={isSubmitting}
              name="password"
              onChange={() => clearError("password")}
              placeholder="密码"
              type="password"
            />
            {errors.password ? (
              <span className="mt-1 block text-xs text-destructive">
                {errors.password}
              </span>
            ) : null}
          </label>

          {errors.form ? (
            <p className="text-center text-sm text-destructive">{errors.form}</p>
          ) : null}

          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? "登录中" : "登录"}
          </Button>
        </form>
      </section>
    </main>
  );
}
