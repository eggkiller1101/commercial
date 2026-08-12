import { NotFoundState } from "@/components/not-found-state";

export default function ProductNotFound() {
  return (
    <NotFoundState
      backHref="/dashboard/products"
      backText="返回产品列表"
      title="未找到该产品"
    />
  );
}
