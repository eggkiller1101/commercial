import { NotFoundState } from "@/components/not-found-state";

export default function SubcategoryNotFound() {
  return (
    <NotFoundState
      backHref="/dashboard/categories/subcategories"
      backText="返回二级分类列表"
      title="未找到该二级分类"
    />
  );
}
