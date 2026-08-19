"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { ImagePlus, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { uploadCmsFile } from "@/features/uploads/client";

import type { CaseFormValues } from "./data";

type CaseFormProps = {
  defaultValues?: CaseFormValues;
};

type CaseFormErrors = Partial<
  Record<
    | "title"
    | "category"
    | "summary"
    | "content"
    | "coverImage"
    | "author"
    | "seoTitle"
    | "seoDescription"
    | "form",
    string
  >
>;

const allowedImageTypes = ["image/jpeg", "image/png"];

export function CaseForm({ defaultValues }: CaseFormProps) {
  const [errors, setErrors] = useState<CaseFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCoverName, setSelectedCoverName] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function clearError(field: keyof CaseFormErrors) {
    setSuccessMessage("");
    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function handleCoverChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];

    setSelectedCoverName(file?.name ?? "");

    if (file && !allowedImageTypes.includes(file.type)) {
      setErrors((currentErrors) => ({
        ...currentErrors,
        coverImage: "封面图片只支持 jpeg、png 格式"
      }));
      return;
    }

    clearError("coverImage");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const nextErrors: CaseFormErrors = {};
    const title = String(formData.get("title") ?? "").trim();
    const category = String(formData.get("category") ?? "").trim();
    const summary = String(formData.get("summary") ?? "").trim();
    const content = String(formData.get("content") ?? "").trim();
    const author = String(formData.get("author") ?? "").trim();
    const seoTitle = String(formData.get("seoTitle") ?? "").trim();
    const seoDescription = String(formData.get("seoDescription") ?? "").trim();
    const coverInput = event.currentTarget.elements.namedItem("coverImage");
    const coverFile =
      coverInput instanceof HTMLInputElement ? coverInput.files?.[0] : null;

    if (!title) {
      nextErrors.title = "请输入案例标题";
    }

    if (!category) {
      nextErrors.category = "请输入案例分类";
    }

    if (!summary) {
      nextErrors.summary = "请输入案例摘要";
    }

    if (!content) {
      nextErrors.content = "请输入案例正文";
    }

    if (coverFile && !allowedImageTypes.includes(coverFile.type)) {
      nextErrors.coverImage = "封面图片只支持 jpeg、png 格式";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSuccessMessage("");
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage("");

    try {
      const isEditing = Boolean(defaultValues?.caseId);
      const uploadedCover =
        coverFile && coverFile.size > 0
          ? await uploadCmsFile(coverFile, "caseCover")
          : null;

      if (uploadedCover && !uploadedCover.ok) {
        setErrors({
          coverImage: uploadedCover.message
        });
        return;
      }

      const response = await fetch(
        isEditing ? `/api/cases/${defaultValues?.caseId}` : "/api/cases",
        {
          body: JSON.stringify({
            author,
            category,
            content,
            coverImageUrl:
              uploadedCover?.ok ? uploadedCover.url : defaultValues?.coverImageUrl ?? "",
            seoDescription,
            seoTitle,
            summary,
            title
          }),
          headers: {
            "Content-Type": "application/json"
          },
          method: isEditing ? "PATCH" : "POST"
        }
      );
      const result = (await response.json()) as {
        caseId?: string;
        message?: string;
        ok?: boolean;
      };

      if (!response.ok || !result.ok) {
        setErrors({
          form: result.message ?? "案例保存失败，请稍后重试"
        });
        return;
      }

      setSuccessMessage(
        isEditing
          ? "案例已保存并上架"
          : `案例已发布，数据库 id：${result.caseId}`
      );
    } catch {
      setErrors({
        form: "案例保存失败，请稍后重试"
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
          <span className="text-sm font-medium">案例标题</span>
          <Input
            defaultValue={defaultValues?.title}
            disabled={isSubmitting}
            name="title"
            onChange={() => clearError("title")}
            placeholder="请输入案例标题"
          />
          {errors.title ? (
            <span className="text-xs text-destructive">{errors.title}</span>
          ) : null}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">案例分类</span>
          <Input
            defaultValue={defaultValues?.category}
            disabled={isSubmitting}
            name="category"
            onChange={() => clearError("category")}
            placeholder="请输入案例分类"
          />
          {errors.category ? (
            <span className="text-xs text-destructive">{errors.category}</span>
          ) : null}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">案例摘要</span>
          <Textarea
            defaultValue={defaultValues?.summary}
            disabled={isSubmitting}
            name="summary"
            onChange={() => clearError("summary")}
            placeholder="请输入案例摘要"
          />
          {errors.summary ? (
            <span className="text-xs text-destructive">{errors.summary}</span>
          ) : null}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">案例正文</span>
          <Textarea
            className="min-h-56"
            defaultValue={defaultValues?.content}
            disabled={isSubmitting}
            name="content"
            onChange={() => clearError("content")}
            placeholder="请输入案例正文"
          />
          {errors.content ? (
            <span className="text-xs text-destructive">{errors.content}</span>
          ) : null}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">封面图片</span>
          <div className="flex min-h-32 flex-col items-center justify-center rounded-md border border-dashed bg-background px-4 py-6 text-center">
            <ImagePlus className="mb-3 h-8 w-8 text-muted-foreground" />
            <Input
              accept="image/jpeg,image/png"
              className="max-w-sm cursor-pointer"
              disabled={isSubmitting}
              name="coverImage"
              onChange={handleCoverChange}
              type="file"
            />
            <p className="mt-3 text-xs text-muted-foreground">
              当前仅保留上传入口，存储接入后会生成真实封面地址。
            </p>
            {selectedCoverName ? (
              <p
                className="mt-2 text-xs text-muted-foreground"
                title={selectedCoverName}
              >
                已选择：{selectedCoverName}
              </p>
            ) : null}
            {defaultValues?.coverImageUrl ? (
              <p
                className="mt-2 max-w-full truncate text-xs text-muted-foreground"
                title={defaultValues.coverImageUrl}
              >
                当前封面：{defaultValues.coverImageUrl}
              </p>
            ) : null}
            {errors.coverImage ? (
              <p className="mt-2 text-xs text-destructive">
                {errors.coverImage}
              </p>
            ) : null}
          </div>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">作者</span>
          <Input
            defaultValue={defaultValues?.author}
            disabled={isSubmitting}
            name="author"
            onChange={() => clearError("author")}
            placeholder="请输入作者，可选"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">SEO 标题</span>
          <Input
            defaultValue={defaultValues?.seoTitle}
            disabled={isSubmitting}
            name="seoTitle"
            onChange={() => clearError("seoTitle")}
            placeholder="默认使用案例标题"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">SEO 描述</span>
          <Textarea
            defaultValue={defaultValues?.seoDescription}
            disabled={isSubmitting}
            name="seoDescription"
            onChange={() => clearError("seoDescription")}
            placeholder="默认使用案例摘要"
          />
        </label>
      </div>

      {errors.form ? (
        <p className="text-right text-sm text-destructive">{errors.form}</p>
      ) : null}

      <div className="flex justify-end">
        <Button disabled={isSubmitting} type="submit">
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "保存中" : "保存案例"}
        </Button>
      </div>

      {successMessage ? (
        <p className="text-right text-sm text-primary">{successMessage}</p>
      ) : null}
    </form>
  );
}
