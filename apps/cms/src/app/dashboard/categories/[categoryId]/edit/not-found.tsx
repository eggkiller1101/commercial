import { NotFoundState } from "@/components/not-found-state";

export default function CategoryNotFound() {
  return (
    <NotFoundState
      backHref="/dashboard/categories"
      backText="返回分类列表"
      title="未找到该分类"
    />
  );
}
