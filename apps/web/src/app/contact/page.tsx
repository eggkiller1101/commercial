import Link from "next/link";

import { InquiryForm } from "@/components/inquiry/inquiry-form";

type ContactPageProps = {
  searchParams: Promise<{
    productId?: string;
  }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const { productId } = await searchParams;

  return (
    <>
      <nav className="breadcrumb container" aria-label="breadcrumb">
        <ol>
          <li>
            <Link href="/">首页</Link>
          </li>
          <li>联系我们</li>
        </ol>
      </nav>

      <div className="hero hero-compact">
        <div className="container hero-inner">
          <div className="hero-eyebrow">联系我们</div>
          <h1>项目选型、报价与技术支持</h1>
          <p>提交您的项目需求，工程师将在 1 个工作日内与您联系；国际项目支持全英文对接。</p>
        </div>
      </div>

      <main className="container" style={{ paddingBottom: 64 }}>
        <section className="section" style={{ paddingTop: 20 }}>
          <div className="contact-channel-grid">
            {[
              ["📞", "服务热线", "400-000-0000", "实时响应"],
              ["✉️", "邮箱咨询", "sales@cloudintelworks.com", "项目资料、报价单接收"],
              ["💬", "微信咨询", "扫描二维码添加工程师", "工作日实时响应"],
              ["📝", "在线询价", "填写下方表单", "或前往询价清单批量提交"]
            ].map(([icon, title, value, desc]) => (
              <div className="contact-channel-card" key={title}>
                <div className="icon-wrap">{icon}</div>
                <h3>{title}</h3>
                <p>{value}</p>
                <p className="text-muted" style={{ fontSize: 11.5, marginTop: 4 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section
          className="section"
          style={{
            alignItems: "start",
            display: "grid",
            gap: 32,
            gridTemplateColumns: "1.3fr 1fr"
          }}
        >
          <div>
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>通用项目咨询表单</h3>
            <p className="text-muted" style={{ fontSize: 13, marginBottom: 16 }}>
              没有具体产品型号也可以直接提交，工程师会根据项目场景推荐合适的解决方案。
            </p>
            <InquiryForm
              defaultMessage={productId ? `咨询产品 ID：${productId}` : ""}
              productId={productId}
              submitLabel="提交咨询"
            />
          </div>

          <div>
            <div className="about-side">
              <h4>办公信息</h4>
              <ul>
                <li>
                  <strong>公司名称</strong>
                  <span>云工智上（北京）科技有限公司</span>
                </li>
                <li>
                  <strong>办公地址</strong>
                  <span>北京市（详细地址以实际合同为准）</span>
                </li>
                <li>
                  <strong>响应时效</strong>
                  <span>实时响应</span>
                </li>
                <li>
                  <strong>国际业务</strong>
                  <span>支持英文邮件 / 视频会议对接</span>
                </li>
              </ul>
            </div>

            <div className="section" style={{ paddingTop: 16 }}>
              <h3 style={{ fontSize: 15, marginBottom: 12 }}>常见问题</h3>
              <details className="faq-item" open>
                <summary>提交询价后多久会有回复？</summary>
                <p>工程师会在 1 个工作日内与您联系，确认产品型号、数量与项目场景后提供正式报价。</p>
              </details>
              <details className="faq-item">
                <summary>是否支持海外项目与英文对接？</summary>
                <p>支持。公司具备成熟的海外项目落地经验，可提供全英文技术资料与现场对接服务。</p>
              </details>
              <details className="faq-item">
                <summary>可以只咨询方案，不确定具体型号吗？</summary>
                <p>可以，直接使用左侧的通用咨询表单描述项目场景即可，工程师会协助选型。</p>
              </details>
              <details className="faq-item">
                <summary>能否批量提交多个产品的询价？</summary>
                <p>
                  可以，前往<Link href="/quote-cart">询价清单</Link>页面，将产品加入清单后一次性提交。
                </p>
              </details>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
