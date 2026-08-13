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
    const title = String(formData.get("title") ?? "").trim();
    const fileType = String(formData.get("fileType") ?? "").trim();
    const language = String(formData.get("language") ?? "").trim();
    const fileInput = event.currentTarget.elements.namedItem("file");
    const file =
      fileInput instanceof HTMLInputElement ? fileInput.files?.[0] : null;

    if (!title) {
      nextErrors.title = "请输入文件标题";
    }

    if (mode === "create" && !file) {
      nextErrors.file = "请上传文件";
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

    if (mode === "create") {
      setErrors({
        form: "文件存储尚未配置，暂时无法保存文件。后续接入 R2 / Supabase Storage 后会在这里上传并生成真实文件地址。"
      });
      setSuccessMessage("");
      return;
    }

    setErrors({
      form: "文件编辑保存接口尚未配置，暂时只从数据库读取文件信息。"
    });
    setSuccessMessage("");
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
                className="max-w-sm cursor-pointer"
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
                  当前仅保留上传入口，文件存储接入后会生成真实文件地址。
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
        <Button type="submit">
          <Save className="mr-2 h-4 w-4" />
          保存文件
        </Button>
      </div>

      {successMessage ? (
        <p className="text-right text-sm text-primary">{successMessage}</p>
      ) : null}
    </form>
  );
}
