"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { ImagePlus, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import type { ProductFormValues } from "./data";

type ProductFormProps = {
  defaultValues?: ProductFormValues;
};

type ProductFormErrors = Partial<
  Record<
    "productName" | "productId" | "description" | "category" | "images" | "form",
    string
  >
>;

const allowedImageTypes = ["image/jpeg", "image/png"];

export function ProductForm({ defaultValues }: ProductFormProps) {
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  function clearError(field: keyof ProductFormErrors) {
    setSuccessMessage("");
    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function validateImages(files: FileList | null) {
    if (!files?.length) {
      return "";
    }

    if (files.length > 6) {
      return "最多只能上传6张图片";
    }

    const hasInvalidType = Array.from(files).some(
      (file) => !allowedImageTypes.includes(file.type)
    );

    if (hasInvalidType) {
      return "图片只支持jpeg、png格式";
    }

    return "";
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const imageError = validateImages(event.currentTarget.files);

    setSuccessMessage("");
    setErrors((currentErrors) => ({
      ...currentErrors,
      images: imageError || undefined
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const nextErrors: ProductFormErrors = {};

    if (!String(formData.get("productName") ?? "").trim()) {
      nextErrors.productName = "请输入产品名称";
    }

    if (!String(formData.get("productId") ?? "").trim()) {
      nextErrors.productId = "请输入产品id";
    }

    if (!String(formData.get("description") ?? "").trim()) {
      nextErrors.description = "请输入产品描述";
    }

    if (!String(formData.get("category") ?? "").trim()) {
      nextErrors.category = "请输入产品分类";
    }

    const imageInput = event.currentTarget.elements.namedItem("images");
    if (imageInput instanceof HTMLInputElement) {
      const imageError = validateImages(imageInput.files);

      if (imageError) {
        nextErrors.images = imageError;
      }
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSuccessMessage("");
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage("");

    try {
      const response = await fetch("/api/products", {
        body: JSON.stringify({
          category: String(formData.get("category") ?? "").trim(),
          description: String(formData.get("description") ?? "").trim(),
          productId: String(formData.get("productId") ?? "").trim(),
          productName: String(formData.get("productName") ?? "").trim()
        }),
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST"
      });
      const result = (await response.json()) as {
        message?: string;
        ok?: boolean;
        productId?: string;
      };

      if (!response.ok || !result.ok) {
        setErrors({
          form: result.message ?? "产品保存失败，请稍后重试"
        });
        return;
      }

      setSuccessMessage(`产品已发布，数据库 id：${result.productId}`);
    } catch {
      setErrors({
        form: "产品保存失败，请稍后重试"
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
          <span className="text-sm font-medium">产品名称</span>
          <Input
            defaultValue={defaultValues?.productName}
            disabled={isSubmitting}
            name="productName"
            onChange={() => clearError("productName")}
            placeholder="请输入产品名称"
          />
          {errors.productName ? (
            <span className="text-xs text-destructive">
              {errors.productName}
            </span>
          ) : null}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">产品id</span>
          <Input
            defaultValue={defaultValues?.productId}
            disabled={isSubmitting}
            name="productId"
            onChange={() => clearError("productId")}
            placeholder="请输入产品id"
          />
          {errors.productId ? (
            <span className="text-xs text-destructive">{errors.productId}</span>
          ) : null}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">产品描述</span>
          <Textarea
            defaultValue={defaultValues?.description}
            disabled={isSubmitting}
            name="description"
            onChange={() => clearError("description")}
            placeholder="请输入产品描述"
          />
          {errors.description ? (
            <span className="text-xs text-destructive">
              {errors.description}
            </span>
          ) : null}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">产品图片</span>
          <div className="flex min-h-32 flex-col items-center justify-center rounded-md border border-dashed bg-background px-4 py-6 text-center">
            <ImagePlus className="mb-3 h-8 w-8 text-muted-foreground" />
            <Input
              accept="image/jpeg,image/png"
              className="max-w-sm cursor-pointer"
              disabled={isSubmitting}
              multiple
              name="images"
              onChange={handleImageChange}
              type="file"
            />
            <p className="mt-3 text-xs text-muted-foreground">
              支持 jpeg、png 格式，最多一次性上传 6 张图。
            </p>
            {errors.images ? (
              <p className="mt-2 text-xs text-destructive">{errors.images}</p>
            ) : null}
            {defaultValues?.images.length ? (
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {defaultValues.images.map((image) => (
                  <span
                    className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
                    key={image}
                  >
                    {image}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">产品分类</span>
          <Input
            defaultValue={defaultValues?.category}
            disabled={isSubmitting}
            name="category"
            onChange={() => clearError("category")}
            placeholder="请输入产品分类"
          />
          {errors.category ? (
            <span className="text-xs text-destructive">{errors.category}</span>
          ) : null}
        </label>
      </div>

      {errors.form ? (
        <p className="text-right text-sm text-destructive">{errors.form}</p>
      ) : null}

      <div className="flex justify-end">
        <Button disabled={isSubmitting} type="submit">
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "保存中" : "保存产品"}
        </Button>
      </div>
      {successMessage ? (
        <p className="text-right text-sm text-primary">{successMessage}</p>
      ) : null}
    </form>
  );
}
