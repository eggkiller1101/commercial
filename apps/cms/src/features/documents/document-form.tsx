"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { FileUp, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { DocumentFormValues } from "./data";

type DocumentFormProps = {
  defaultValues?: DocumentFormValues;
  mode?: "create" | "edit";
};

type DocumentFormErrors = Partial<
  Record<"file" | "fileType" | "language" | "title" | "version" | "form", string>
>;

export function DocumentForm({
  defaultValues,
  mode = "create"
}: DocumentFormProps) {
  const [errors, setErrors] = useState<DocumentFormErrors>({});
  const [selectedFileName, setSelectedFileName] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    if (mode === "edit") {
      setErrors({
        form: "文件编辑保存接口尚未配置，暂时只从数据库读取文件信息。"
      });
      setSuccessMessage("");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const nextErrors: DocumentFormErrors = {};
    const title = String(formData.get("title") ?? "").trim();
    const fileType = String(formData.get("fileType") ?? "").trim();
    const language = String(formData.get("language") ?? "").trim();
    const version = String(formData.get("version") ?? "").trim();
    const fileInput = event.currentTarget.elements.namedItem("file");
    const file =
      fileInput instanceof HTMLInputElement ? fileInput.files?.[0] : null;

    if (!title) {
      nextErrors.title = "请输入文件标题";
    }
    if (!file) {
      nextErrors.file = "请上传文件";
    }
    if (!fileType) {
      nextErrors.fileType = "请输入文件类型";
    }
    if (!language) {
      nextErrors.language = "请输入语言";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0 || !file) {
      setSuccessMessage("");
      return;
    }

    setIsSubmitting(true);
    setSuccessMessage("");

    try {
      const uploadForm = new FormData();
      uploadForm.set("file", file);
      uploadForm.set("kind", "documents");

      const uploadResponse = await fetch("/api/upload", {
        body: uploadForm,
        method: "POST"
      });
      const uploadResult = (await uploadResponse.json()) as {
        message?: string;
        ok?: boolean;
        url?: string;
      };

      if (!uploadResponse.ok || !uploadResult.ok || !uploadResult.url) {
        setErrors({ form: uploadResult.message ?? "文件上传失败，请稍后重试" });
        return;
      }

      const response = await fetch("/api/documents", {
        body: JSON.stringify({
          fileType,
          fileUrl: uploadResult.url,
          language,
          title,
          version
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      const result = (await response.json()) as {
        message?: string;
        ok?: boolean;
      };

      if (!response.ok || !result.ok) {
        setErrors({ form: result.message ?? "文件保存失败，请稍后重试" });
        return;
      }

      setSuccessMessage("文件已保存");
    } catch {
      setErrors({ form: "文件保存失败，请稍后重试" });
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

        {mode === "create" ? (
          <label className="grid gap-2">
            <span className="text-sm font-medium">上传文件</span>
            <div className="flex min-h-32 flex-col items-center justify-center rounded-md border border-dashed bg-background px-4 py-6 text-center">
              <FileUp className="mb-3 h-8 w-8 text-muted-foreground" />
              <Input
                accept="image/jpeg,image/png,image/webp,application/pdf"
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
                  支持 jpeg / png / webp / pdf，最大 20MB。
                </p>
              )}
              {errors.file ? (
                <p className="mt-2 text-xs text-destructive">{errors.file}</p>
              ) : null}
            </div>
          </label>
        ) : null}

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
