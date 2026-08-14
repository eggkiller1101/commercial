"use client";

import { useState, type FormEvent } from "react";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { CategoryOption, SubcategoryFormValues } from "./data";

type SubcategoryFormProps = {
  categoryOptions: CategoryOption[];
  defaultValues?: SubcategoryFormValues;
};

type SubcategoryFormErrors = Partial<
  Record<"categoryId" | "slug" | "subcategoryName" | "form", string>
>;

export function SubcategoryForm({
  categoryOptions,
  defaultValues
}: SubcategoryFormProps) {
  const [errors, setErrors] = useState<SubcategoryFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  function clearError(field: keyof SubcategoryFormErrors) {
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
    const nextErrors: SubcategoryFormErrors = {};
    const categoryId = String(formData.get("categoryId") ?? "").trim();
    const slug = String(formData.get("slug") ?? "").trim();
    const subcategoryName = String(
      formData.get("subcategoryName") ?? ""
    ).trim();

    if (!categoryId) {
      nextErrors.categoryId = "请选择所属一级分类";
    }

    if (!subcategoryName) {
      nextErrors.subcategoryName = "请输入二级分类名称";
    }

    if (!slug) {
      nextErrors.slug = "请输入二级分类 slug";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSuccessMessage("");
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage("");

    try {
      const isEditing = Boolean(defaultValues?.subcategoryId);
      const response = await fetch(
        isEditing
          ? `/api/categories/subcategories/${defaultValues?.subcategoryId}`
          : "/api/categories/subcategories",
        {
          body: JSON.stringify({
            categoryId,
            slug,
            subcategoryName
          }),
          headers: {
            "Content-Type": "application/json"
          },
          method: isEditing ? "PATCH" : "POST"
        }
      );
      const result = (await response.json()) as {
        message?: string;
        ok?: boolean;
        subcategoryId?: string;
      };

      if (!response.ok || !result.ok) {
        setErrors({
          form: result.message ?? "二级分类保存失败，请稍后重试"
        });
        return;
      }

      setSuccessMessage(
        isEditing
          ? "二级分类已保存"
          : `二级分类已保存，数据库 id：${result.subcategoryId}`
      );
    } catch {
      setErrors({
        form: "二级分类保存失败，请稍后重试"
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
          <span className="text-sm font-medium">所属一级分类</span>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            defaultValue={defaultValues?.categoryId}
            disabled={isSubmitting}
            name="categoryId"
            onChange={() => clearError("categoryId")}
          >
            <option value="">请选择所属一级分类</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId ? (
            <span className="text-xs text-destructive">
              {errors.categoryId}
            </span>
          ) : null}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">二级分类名称</span>
          <Input
            defaultValue={defaultValues?.subcategoryName}
            disabled={isSubmitting}
            name="subcategoryName"
            onChange={() => clearError("subcategoryName")}
            placeholder="请输入二级分类名称"
          />
          {errors.subcategoryName ? (
            <span className="text-xs text-destructive">
              {errors.subcategoryName}
            </span>
          ) : null}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">二级分类 slug</span>
          <Input
            defaultValue={defaultValues?.slug}
            disabled={isSubmitting}
            name="slug"
            onChange={() => clearError("slug")}
            placeholder="请输入二级分类 slug"
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
          {isSubmitting ? "保存中" : "保存二级分类"}
        </Button>
      </div>

      {successMessage ? (
        <p className="text-right text-sm text-primary">{successMessage}</p>
      ) : null}
    </form>
  );
}
