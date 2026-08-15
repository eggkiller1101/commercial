import { PageHero } from "@/components/layout/page-hero";
import { InquiryForm } from "@/components/inquiry/inquiry-form";

export default function InquiryPage() {
  return (
    <div>
      <PageHero
        description="没有具体产品也可以先提交需求，工程师会根据描述推荐合适的产品组合。"
        eyebrow="询价"
        title="提交询价"
      />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <InquiryForm />
      </div>
    </div>
  );
}
