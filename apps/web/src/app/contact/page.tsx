import { PageHero } from "@/components/layout/page-hero";
import { WechatQrTrigger } from "@/components/layout/wechat-qr-trigger";
import { InquiryForm } from "@/components/inquiry/inquiry-form";
import { SITE_CONFIG } from "@/lib/site-config";

const CHANNELS = [
  { label: "服务热线", value: SITE_CONFIG.SERVICE_HOTLINE },
  { label: "邮箱咨询", value: SITE_CONFIG.SERVICE_EMAIL }
];

export default function ContactPage() {
  return (
    <div>
      <PageHero
        description="服务热线、邮箱与在线询价，工程师会在 1 个工作日内与您联系；国际项目支持全英文对接。"
        eyebrow="联系我们"
        title={SITE_CONFIG.SITE_NAME_FULL}
      />

      <div className="mx-auto max-w-site px-4 py-10">
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CHANNELS.map((channel) => (
            <div className="rounded-lg border border-border bg-card p-5" key={channel.label}>
              <p className="text-xs text-muted-foreground">{channel.label}</p>
              <p className="mt-1.5 text-[15px] font-semibold">{channel.value}</p>
            </div>
          ))}
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground">微信咨询</p>
            <p className="mt-1.5 text-[15px] font-semibold">
              <WechatQrTrigger label={SITE_CONFIG.WECHAT_LABEL} />
            </p>
          </div>
        </div>

        <div className="max-w-2xl">
          <h2 className="mb-4 text-lg font-semibold">在线留言</h2>
          <InquiryForm />
        </div>
      </div>
    </div>
  );
}
