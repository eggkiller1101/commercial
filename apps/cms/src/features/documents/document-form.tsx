"use client";

import { useState, type FormEvent } from "react";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { DocumentFormValues } from "./data";

type DocumentFormProps = {
  defaultValues?: DocumentFormValues;
};

type DocumentFormErrors = Partial<
  Record<"fileType" | "fileUrl" | "language" | "title" | "version" | "form", string>
>;

export function DocumentForm({ defaultValues }: DocumentFormProps) {
  const [errors, setErrors] = useState<DocumentFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  function clearError(field: keyof DocumentFormErrors) {
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
    const nextErrors: DocumentFormErrors = {};
    const title = String(formData.get("title") ?? "").trim();
    const fileUrl = String(formData.get("fileUrl") ?? "").trim();
    const fileType = String(formData.get("fileType") ?? "").trim();
    const language = String(formData.get("language") ?? "").trim();
    const version = String(formData.get("version") ?? "").trim();

    if (!title) {
      nextErrors.title = "请输入文件标题";
    }

    if (!fileUrl) {
      nextErrors.fileUrl = "请输入文件地址";
    }

    if (!fileType) {
      nextErrors.fileType = "请输入文件类型";
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
      const response = await fetch("/api/documents", {
        body: JSON.stringify({
          fileType,
          fileUrl,
          language,
          title,
          version
        }),
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST"
      });
      const result = (await response.json()) as {
        documentId?: string;
        message?: string;
        ok?: boolean;
      };

      if (!response.ok || !result.ok) {
        setErrors({
          form: result.message ?? "文件保存失败，请稍后重试"
        });
        return;
      }

      setSuccessMessage(`文件已保存，数据库 id：${result.documentId}`);
    } catch {
      setErrors({
        form: "文件保存失败，请稍后重试"
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
          <span className="text-sm font-medium">文件标题</span>
          <Input
            defaultValue={defaultValues?.title}
            disabled={isSubmitting}
            name="title"
            onChange={() => clearError("title")}
            placeholder="请输入文件标题"
          />
          {errors.title ? (
            <span className="text-xs text-destructive">{errors.title}</span>
          ) : null}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">文件地址</span>
          <Input
            defaultValue={defaultValues?.fileUrl}
            disabled={isSubmitting}
            name="fileUrl"
            onChange={() => clearError("fileUrl")}
            placeholder="请输入文件地址"
          />
          {errors.fileUrl ? (
            <span className="text-xs text-destructive">{errors.fileUrl}</span>
          ) : null}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">文件类型</span>
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
          {isSubmitting ? "保存中" : "保存文件"}
        </Button>
      </div>

      {successMessage ? (
        <p className="text-right text-sm text-primary">{successMessage}</p>
      ) : null}
    </form>
  );
}
