"use client";

import { useState, type FormEvent } from "react";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { DocumentCategoryFormValues } from "./data";

type DocumentCategoryFormProps = {
  defaultValues?: DocumentCategoryFormValues;
};

type DocumentCategoryFormErrors = Partial<
  Record<"form" | "name" | "slug", string>
>;

export function DocumentCategoryForm({
  defaultValues
}: DocumentCategoryFormProps) {
  const [errors, setErrors] = useState<DocumentCategoryFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  function clearError(field: keyof DocumentCategoryFormErrors) {
    setSuccessMessage("");
    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const slug = String(formData.get("slug") ?? "").trim();
    const nextErrors: DocumentCategoryFormErrors = {};

    if (!name) {
      nextErrors.name = "请输入资料分类名称";
    }

    if (!slug) {
      nextErrors.slug = "请输入资料分类 slug";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSuccessMessage("");
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage("");

    try {
      const isEditing = Boolean(defaultValues?.documentCategoryId);
      const response = await fetch(
        isEditing
          ? `/api/categories/documents/${defaultValues?.documentCategoryId}`
          : "/api/categories/documents",
        {
          body: JSON.stringify({
            name,
            slug
          }),
          headers: {
            "Content-Type": "application/json"
          },
          method: isEditing ? "PATCH" : "POST"
        }
      );
      const result = (await response.json()) as {
        documentCategoryId?: string;
        message?: string;
        ok?: boolean;
      };

      if (!response.ok || !result.ok) {
        setErrors({
          form: result.message ?? "资料分类保存失败，请稍后重试"
        });
        return;
      }

      setSuccessMessage(
        isEditing
          ? "资料分类已保存"
          : `资料分类已保存，数据库 id：${result.documentCategoryId}`
      );
    } catch {
      setErrors({
        form: "资料分类保存失败，请稍后重试"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="space-y-6 rounded-md border bg-card p-6"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-5">
        <label className="grid gap-2">
          <span className="text-sm font-medium">资料分类名称</span>
          <Input
            defaultValue={defaultValues?.name}
            disabled={isSubmitting}
            name="name"
            onChange={() => clearError("name")}
            placeholder="例如 认证证书、安装指南"
          />
          {errors.name ? (
            <span className="text-xs text-destructive">{errors.name}</span>
          ) : null}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">资料分类 slug</span>
          <Input
            defaultValue={defaultValues?.slug}
            disabled={isSubmitting}
            name="slug"
            onChange={() => clearError("slug")}
            placeholder="例如 certificates"
          />
          {errors.slug ? (
            <span className="text-xs text-destructive">{errors.slug}</span>
          ) : null}
        </label>
      </div>

      {errors.form ? (
        <p className="text-right text-sm text-destructive">{errors.form}</p>
      ) : null}

      <div className="flex justify-end">
        <Button disabled={isSubmitting} type="submit">
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "保存中" : "保存资料分类"}
        </Button>
      </div>

      {successMessage ? (
        <p className="text-right text-sm text-primary">{successMessage}</p>
      ) : null}
    </form>
  );
}
