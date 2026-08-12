"use client";

import { useState, type FormEvent } from "react";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import type { CategoryFormValues } from "./data";

type CategoryFormProps = {
  defaultValues?: CategoryFormValues;
};

type CategoryFormErrors = Partial<
  Record<"categoryName" | "description" | "slug" | "form", string>
>;

export function CategoryForm({ defaultValues }: CategoryFormProps) {
  const [errors, setErrors] = useState<CategoryFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  function clearError(field: keyof CategoryFormErrors) {
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
    const nextErrors: CategoryFormErrors = {};
    const categoryName = String(formData.get("categoryName") ?? "").trim();
    const slug = String(formData.get("slug") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();

    if (!categoryName) {
      nextErrors.categoryName = "请输入分类名称";
    }

    if (!slug) {
      nextErrors.slug = "请输入分类slug";
    }

    if (!description) {
      nextErrors.description = "请输入分类描述";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSuccessMessage("");
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage("");

    try {
      const response = await fetch("/api/categories", {
        body: JSON.stringify({
          categoryName,
          description,
          slug
        }),
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST"
      });
      const result = (await response.json()) as {
        categoryId?: string;
        message?: string;
        ok?: boolean;
      };

      if (!response.ok || !result.ok) {
        setErrors({
          form: result.message ?? "分类保存失败，请稍后重试"
        });
        return;
      }

      setSuccessMessage(`分类已保存，数据库 id：${result.categoryId}`);
    } catch {
      setErrors({
        form: "分类保存失败，请稍后重试"
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
          <span className="text-sm font-medium">分类名称</span>
          <Input
            defaultValue={defaultValues?.categoryName}
            disabled={isSubmitting}
            name="categoryName"
            onChange={() => clearError("categoryName")}
            placeholder="请输入分类名称"
          />
          {errors.categoryName ? (
            <span className="text-xs text-destructive">
              {errors.categoryName}
            </span>
          ) : null}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">分类slug</span>
          <Input
            defaultValue={defaultValues?.slug}
            disabled={isSubmitting}
            name="slug"
            onChange={() => clearError("slug")}
            placeholder="请输入分类slug"
          />
          {errors.slug ? (
            <span className="text-xs text-destructive">{errors.slug}</span>
          ) : null}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">分类描述</span>
          <Textarea
            defaultValue={defaultValues?.description}
            disabled={isSubmitting}
            name="description"
            onChange={() => clearError("description")}
            placeholder="请输入分类描述"
          />
          {errors.description ? (
            <span className="text-xs text-destructive">
              {errors.description}
            </span>
          ) : null}
        </label>
      </div>

      {errors.form ? (
        <p className="text-right text-sm text-destructive">{errors.form}</p>
      ) : null}

      <div className="flex justify-end">
        <Button disabled={isSubmitting} type="submit">
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "保存中" : "保存分类"}
        </Button>
      </div>

      {successMessage ? (
        <p className="text-right text-sm text-primary">{successMessage}</p>
      ) : null}
    </form>
  );
}
