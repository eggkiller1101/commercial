import { NotFoundState } from "@/components/not-found-state";

export default function InquiryNotFound() {
  return (
    <NotFoundState
      backHref="/dashboard/inquiries"
      backText="返回询价列表"
      title="未找到该询价"
    />
  );
}
