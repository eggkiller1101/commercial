import Link from "next/link";

import { QuoteCartPanel } from "@/components/quote-cart/quote-cart-panel";

type QuoteCartPageProps = {
  searchParams: Promise<{
    productId?: string;
  }>;
};

export default async function QuoteCartPage({ searchParams }: QuoteCartPageProps) {
  const { productId } = await searchParams;

  return (
    <>
      <nav className="breadcrumb container" aria-label="breadcrumb">
        <ol>
          <li>
            <Link href="/">首页</Link>
          </li>
          <li>询价清单</li>
        </ol>
      </nav>

      <main className="container" style={{ paddingBottom: 64 }}>
        <section className="section" style={{ paddingTop: 14 }}>
          <div className="section-head">
            <div>
              <h2>询价清单</h2>
              <p>确认清单内容，补充项目信息后一键提交，工程师将在 1 个工作日内与您联系</p>
            </div>
          </div>

          <QuoteCartPanel productId={productId} />

          <div className="section" id="process-section">
            <div className="section-head">
              <div>
                <h2>提交后如何处理</h2>
                <p>从提交询价到拿到正式报价，一共 4 步</p>
              </div>
            </div>
            <div className="process-steps">
              {[
                ["1", "提交询价", "确认清单与项目信息后一键提交"],
                ["2", "工程师核对", "1 个工作日内核对型号规格与项目场景"],
                ["3", "方案与报价", "提供选型建议、供货周期与正式报价单"],
                ["4", "合同与供货", "确认无误后签署合同，安排生产与物流"]
              ].map(([num, title, desc]) => (
                <div className="process-step" key={num}>
                  <div className="step-num">{num}</div>
                  <h4>{title}</h4>
                  <p>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
