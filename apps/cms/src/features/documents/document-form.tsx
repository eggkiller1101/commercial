"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { FileUp, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadCmsFile } from "@/features/uploads/client";

import type { DocumentFormValues } from "./data";
import type { CategoryOption } from "@/features/categories/data";

type DocumentFormProps = {
  defaultValues?: DocumentFormValues;
  mode?: "create" | "edit";
  options: {
    categories: CategoryOption[];
  };
};

type DocumentFormErrors = Partial<
  Record<
    "categoryId" | "file" | "fileType" | "form" | "language" | "title" | "version",
    string
  >
>;

export function DocumentForm({
  defaultValues,
  mode = "create",
  options
}: DocumentFormProps) {
  const [errors, setErrors] = useState<DocumentFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function clearError(field: keyof DocumentFormErrors) {
    setSuccessMessage("");
    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];

    setSelectedFileName(file?.name ?? "");
    clearError("file");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const nextErrors: DocumentFormErrors = {};
    const categoryId = String(formData.get("categoryId") ?? "").trim();
    const title = String(formData.get("title") ?? "").trim();
    const fileType = String(formData.get("fileType") ?? "").trim();
    const language = String(formData.get("language") ?? "").trim();
    const fileInput = event.currentTarget.elements.namedItem("file");
    const file =
      fileInput instanceof HTMLInputElement ? fileInput.files?.[0] : null;

    if (!categoryId) {
      nextErrors.categoryId = "请选择资料分类";
    }

    if (!title) {
      nextErrors.title = "请输入资料标题";
    }

    if (mode === "create" && !file) {
      nextErrors.file = "请上传资料";
    }

    if (!fileType) {
      nextErrors.fileType = "请输入资料类型";
    }

    if (!language) {
      nextErrors.language = "请输入语言";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSuccessMessage("");
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage("");

    try {
      const isEditing = Boolean(defaultValues?.documentId);
      const uploadedFile =
        file && file.size > 0 ? await uploadCmsFile(file, "document") : null;

      if (uploadedFile && !uploadedFile.ok) {
        setErrors({
          file: uploadedFile.message
        });
        return;
      }

      const uploadedFileUrl = uploadedFile?.ok ? uploadedFile.url : null;
      const response = await fetch(
        isEditing
          ? `/api/documents/${defaultValues?.documentId}`
          : "/api/documents",
        {
          body: JSON.stringify({
            categoryId,
            fileType,
            fileUrl: uploadedFileUrl ?? defaultValues?.fileUrl ?? "",
            language,
            title,
            version: String(formData.get("version") ?? "").trim()
          }),
          headers: {
            "Content-Type": "application/json"
          },
          method: isEditing ? "PATCH" : "POST"
        }
      );
      const result = (await response.json()) as {
        documentId?: string;
        message?: string;
        ok?: boolean;
      };

      if (!response.ok || !result.ok) {
        setErrors({
          form:
            result.message ??
            "资料保存失败，请稍后重试。当前资料存储接入前，新增资料仍需要真实资料地址。"
        });
        return;
      }

      setSuccessMessage(
        isEditing ? "资料已保存" : `资料已保存，数据库 id：${result.documentId}`
      );
    } catch {
      setErrors({
        form: "资料保存失败，请稍后重试"
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
          <span className="text-sm font-medium">资料分类</span>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            defaultValue={defaultValues?.categoryId}
            disabled={isSubmitting}
            name="categoryId"
            onChange={() => clearError("categoryId")}
          >
            <option value="">请选择资料分类</option>
            {options.categories.map((category) => (
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
          <span className="text-sm font-medium">资料标题</span>
          <Input
            defaultValue={defaultValues?.title}
            disabled={isSubmitting}
            name="title"
            onChange={() => clearError("title")}
            placeholder="请输入资料标题"
          />
          {errors.title ? (
            <span className="text-xs text-destructive">{errors.title}</span>
          ) : null}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">上传资料</span>
          <div className="flex min-h-32 flex-col items-center justify-center rounded-md border border-dashed bg-background px-4 py-6 text-center">
            <FileUp className="mb-3 h-8 w-8 text-muted-foreground" />
            <Input
              accept=".pdf,.csv,.doc,.docx,.xls,.xlsx"
              className="max-w-sm cursor-pointer"
              disabled={isSubmitting}
              name="file"
              onChange={handleFileChange}
              type="file"
            />
            {selectedFileName ? (
              <p className="mt-3 text-xs text-muted-foreground">
                已选择：{selectedFileName}
              </p>
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">
                {mode === "create"
                  ? "上传后会存入 R2，并自动写入资料地址。"
                  : "不选择新文件时，将保留当前资料地址。"}
              </p>
            )}
            {defaultValues?.fileUrl ? (
              <p
                className="mt-2 max-w-full truncate text-xs text-muted-foreground"
                title={defaultValues.fileUrl}
              >
                当前资料：{defaultValues.fileUrl}
              </p>
            ) : null}
            {errors.file ? (
              <p className="mt-2 text-xs text-destructive">{errors.file}</p>
            ) : null}
          </div>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">资料类型</span>
          <Input
            defaultValue={defaultValues?.fileType}
            disabled={isSubmitting}
            name="fileType"
            onChange={() => clearError("fileType")}
            placeholder="例如 pdf、csv、docx"
          />
          {errors.fileType ? (
            <span className="text-xs text-destructive">{errors.fileType}</span>
          ) : null}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">语言</span>
          <Input
            defaultValue={defaultValues?.language ?? "zh-CN"}
            disabled={isSubmitting}
            name="language"
            onChange={() => clearError("language")}
            placeholder="zh-CN"
          />
          {errors.language ? (
            <span className="text-xs text-destructive">{errors.language}</span>
          ) : null}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">版本</span>
          <Input
            defaultValue={defaultValues?.version}
            disabled={isSubmitting}
            name="version"
            onChange={() => clearError("version")}
            placeholder="请输入版本，可选"
          />
        </label>
      </div>

      {errors.form ? (
        <p className="text-right text-sm text-destructive">{errors.form}</p>
      ) : null}

      <div className="flex justify-end">
        <Button disabled={isSubmitting} type="submit">
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "保存中" : "保存资料"}
        </Button>
      </div>

      {successMessage ? (
        <p className="text-right text-sm text-primary">{successMessage}</p>
      ) : null}
    </form>
  );
}
