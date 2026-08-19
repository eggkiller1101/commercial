"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { ImagePlus, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { uploadCmsFile } from "@/features/uploads/client";

import type { ProductFormOptions, ProductFormValues } from "./data";

type ProductFormProps = {
  defaultValues?: ProductFormValues;
  options: ProductFormOptions;
};

type ProductFormErrors = Partial<
  Record<
    | "productName"
    | "productModel"
    | "summary"
    | "description"
    | "applicationNotes"
    | "primaryCategoryId"
    | "subcategoryId"
    | "sku"
    | "images"
    | "form",
    string
  >
>;

const allowedImageTypes = ["image/jpeg", "image/png"];

export function ProductForm({ defaultValues, options }: ProductFormProps) {
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    defaultValues?.primaryCategoryId ?? ""
  );
  const [successMessage, setSuccessMessage] = useState("");

  const visibleSubcategories = options.subcategories.filter(
    (subcategory) => subcategory.categoryId === selectedCategoryId
  );

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

    if (!String(formData.get("productModel") ?? "").trim()) {
      nextErrors.productModel = "请输入产品型号";
    }

    if (!String(formData.get("summary") ?? "").trim()) {
      nextErrors.summary = "请输入产品简介";
    }

    if (!String(formData.get("description") ?? "").trim()) {
      nextErrors.description = "请输入产品描述";
    }

    if (!String(formData.get("primaryCategoryId") ?? "").trim()) {
      nextErrors.primaryCategoryId = "请选择一级分类";
    }

    if (!String(formData.get("subcategoryId") ?? "").trim()) {
      nextErrors.subcategoryId = "请选择二级分类";
    }

    if (!String(formData.get("sku") ?? "").trim()) {
      nextErrors.sku = "请输入 SKU 编码";
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
      const isEditing = Boolean(defaultValues?.databaseId);
      const imageInput = event.currentTarget.elements.namedItem("images");
      const imageFiles =
        imageInput instanceof HTMLInputElement
          ? Array.from(imageInput.files ?? [])
          : [];
      const uploadedImageUrls: string[] = [];

      for (const imageFile of imageFiles) {
        const uploadedImage = await uploadCmsFile(imageFile, "productImage");

        if (!uploadedImage.ok) {
          setErrors({
            images: uploadedImage.message
          });
          return;
        }

        uploadedImageUrls.push(uploadedImage.url);
      }

      const response = await fetch(
        isEditing ? `/api/products/${defaultValues?.databaseId}` : "/api/products",
        {
        body: JSON.stringify({
          applicationNotes: String(
            formData.get("applicationNotes") ?? ""
          ).trim(),
          description: String(formData.get("description") ?? "").trim(),
          imageUrls: uploadedImageUrls,
          isFeatured: String(formData.get("isFeatured") ?? "false") === "true",
          primaryCategoryId: String(
            formData.get("primaryCategoryId") ?? ""
          ).trim(),
          productModel: String(formData.get("productModel") ?? "").trim(),
          productName: String(formData.get("productName") ?? "").trim(),
          sku: String(formData.get("sku") ?? "").trim(),
          subcategoryId: String(formData.get("subcategoryId") ?? "").trim(),
          summary: String(formData.get("summary") ?? "").trim()
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
        productId?: string;
      };

      if (!response.ok || !result.ok) {
        setErrors({
          form: result.message ?? "产品保存失败，请稍后重试"
        });
        return;
      }

      setSuccessMessage(
        isEditing
          ? "产品已保存并上架"
          : `产品已发布，数据库 id：${result.productId}`
      );
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
          <span className="text-sm font-medium">产品型号</span>
          <Input
            defaultValue={defaultValues?.productModel}
            disabled={isSubmitting}
            name="productModel"
            onChange={() => clearError("productModel")}
            placeholder="请输入产品型号"
          />
          {errors.productModel ? (
            <span className="text-xs text-destructive">
              {errors.productModel}
            </span>
          ) : null}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">SKU 编码</span>
          <Input
            defaultValue={defaultValues?.sku}
            disabled={isSubmitting}
            name="sku"
            onChange={() => clearError("sku")}
            placeholder="请输入 SKU 编码"
          />
          {errors.sku ? (
            <span className="text-xs text-destructive">{errors.sku}</span>
          ) : null}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">产品简介</span>
          <Textarea
            defaultValue={defaultValues?.summary}
            disabled={isSubmitting}
            name="summary"
            onChange={() => clearError("summary")}
            placeholder="请输入产品简介，用于 web 前台列表展示"
          />
          {errors.summary ? (
            <span className="text-xs text-destructive">{errors.summary}</span>
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
          <span className="text-sm font-medium">应用说明</span>
          <Textarea
            defaultValue={defaultValues?.applicationNotes}
            disabled={isSubmitting}
            name="applicationNotes"
            onChange={() => clearError("applicationNotes")}
            placeholder="请输入适用场景、安装注意事项，可选"
          />
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
          <span className="text-sm font-medium">一级分类</span>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            defaultValue={defaultValues?.primaryCategoryId}
            disabled={isSubmitting}
            name="primaryCategoryId"
            onChange={(event) => {
              setSelectedCategoryId(event.currentTarget.value);
              clearError("primaryCategoryId");
            }}
          >
            <option value="">请选择一级分类</option>
            {options.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.primaryCategoryId ? (
            <span className="text-xs text-destructive">
              {errors.primaryCategoryId}
            </span>
          ) : null}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">二级分类</span>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            defaultValue={defaultValues?.subcategoryId}
            disabled={isSubmitting || !selectedCategoryId}
            name="subcategoryId"
            onChange={() => clearError("subcategoryId")}
          >
            <option value="">请选择二级分类</option>
            {visibleSubcategories.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </option>
            ))}
          </select>
          {errors.subcategoryId ? (
            <span className="text-xs text-destructive">
              {errors.subcategoryId}
            </span>
          ) : null}
        </label>

        <fieldset className="grid gap-2">
          <span className="text-sm font-medium">是否推荐</span>
          <div className="flex gap-4 rounded-md border bg-background px-3 py-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                defaultChecked={defaultValues?.isFeatured === true}
                disabled={isSubmitting}
                name="isFeatured"
                type="radio"
                value="true"
              />
              是
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                defaultChecked={defaultValues?.isFeatured !== true}
                disabled={isSubmitting}
                name="isFeatured"
                type="radio"
                value="false"
              />
              否
            </label>
          </div>
        </fieldset>
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
