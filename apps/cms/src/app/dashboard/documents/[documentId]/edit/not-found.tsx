import { NotFoundState } from "@/components/not-found-state";

export default function DocumentNotFound() {
  return (
    <NotFoundState
      backHref="/dashboard/documents"
      backText="返回资料列表"
      title="未找到该资料"
    />
  );
}
