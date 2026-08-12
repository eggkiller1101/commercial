import { NotFoundState } from "@/components/not-found-state";

export default function DocumentNotFound() {
  return (
    <NotFoundState
      backHref="/dashboard/documents"
      backText="返回文件分类"
      title="未找到该文件"
    />
  );
}
