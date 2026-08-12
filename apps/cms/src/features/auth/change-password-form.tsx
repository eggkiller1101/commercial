"use client";

import { useState, type FormEvent } from "react";
import { LockKeyhole } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PasswordField = "confirmPassword" | "currentPassword" | "newPassword";
type PasswordErrors = Partial<Record<PasswordField | "form", string>>;

export function ChangePasswordForm() {
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function clearError(field: PasswordField) {
    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      delete nextErrors.form;
      return nextErrors;
    });
    setSuccessMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const currentPassword = String(formData.get("currentPassword") ?? "");
    const newPassword = String(formData.get("newPassword") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");
    const nextErrors: PasswordErrors = {};

    if (!currentPassword) {
      nextErrors.currentPassword = "请输入当前密码";
    }

    if (!newPassword) {
      nextErrors.newPassword = "请输入新密码";
    } else if (newPassword.length < 8) {
      nextErrors.newPassword = "新密码至少需要8位";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "请再次输入新密码";
    } else if (newPassword && newPassword !== confirmPassword) {
      nextErrors.confirmPassword = "两次输入的新密码不一致";
    }

    setErrors(nextErrors);
    setSuccessMessage("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        body: JSON.stringify({
          confirmPassword,
          currentPassword,
          newPassword
        }),
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
          form: result.message ?? "修改密码失败，请稍后重试"
        });
        return;
      }

      form.reset();
      setSuccessMessage("密码修改成功");
    } catch {
      setErrors({
        form: "修改密码失败，请稍后重试"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="max-w-xl space-y-5" onSubmit={handleSubmit}>
      <label className="block">
        <span className="mb-2 block text-sm font-medium">当前密码</span>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10"
            disabled={isSubmitting}
            name="currentPassword"
            onChange={() => clearError("currentPassword")}
            type="password"
          />
        </div>
        {errors.currentPassword ? (
          <span className="mt-1 block text-xs text-destructive">
            {errors.currentPassword}
          </span>
        ) : null}
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium">新密码</span>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10"
            disabled={isSubmitting}
            name="newPassword"
            onChange={() => clearError("newPassword")}
            type="password"
          />
        </div>
        {errors.newPassword ? (
          <span className="mt-1 block text-xs text-destructive">
            {errors.newPassword}
          </span>
        ) : null}
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium">确认新密码</span>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10"
            disabled={isSubmitting}
            name="confirmPassword"
            onChange={() => clearError("confirmPassword")}
            type="password"
          />
        </div>
        {errors.confirmPassword ? (
          <span className="mt-1 block text-xs text-destructive">
            {errors.confirmPassword}
          </span>
        ) : null}
      </label>

      {errors.form ? (
        <p className="text-sm text-destructive">{errors.form}</p>
      ) : null}
      {successMessage ? (
        <p className="text-sm text-emerald-600">{successMessage}</p>
      ) : null}

      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? "保存中" : "保存密码"}
      </Button>
    </form>
  );
}
