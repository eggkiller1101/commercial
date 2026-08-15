import { PageHero } from "@/components/layout/page-hero";
import { QuoteCartView } from "@/components/quote-cart/quote-cart-view";

export default function QuoteCartPage() {
  return (
    <div>
      <PageHero
        description="确认清单内容，补充项目信息后一键提交，工程师将在 1 个工作日内与您联系。"
        eyebrow="询价清单"
        title="询价清单"
      />
      <div className="mx-auto max-w-site px-4 py-10">
        <QuoteCartView />
      </div>
    </div>
  );
}
