import { NotFoundState } from "@/components/not-found-state";

export default function CaseNotFound() {
  return (
    <NotFoundState
      backHref="/dashboard/cases"
      backText="返回案例列表"
      title="未找到该案例"
    />
  );
}
