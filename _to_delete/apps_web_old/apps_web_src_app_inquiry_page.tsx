import { InquiryForm } from "@/components/inquiry/inquiry-form";

export default function InquiryPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">提交询价</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          这是 web 前台唯一需要写入数据库的业务入口之一。
        </p>
      </div>
      <InquiryForm />
    </div>
  );
}
