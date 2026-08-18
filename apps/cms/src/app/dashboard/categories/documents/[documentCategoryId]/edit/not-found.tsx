import { NotFoundState } from "@/components/not-found-state";

export default function DocumentCategoryNotFound() {
  return (
    <NotFoundState
      backHref="/dashboard/categories/documents"
      backText="返回资料分类"
      title="未找到该资料分类"
    />
  );
}
