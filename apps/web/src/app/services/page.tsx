import Link from "next/link";

const services = [
  ["/assets/icons/adv-design.svg", "产品选型与技术参数确认", "结合项目场景、压力等级、管径范围和认证要求完成选型。"],
  ["/assets/icons/adv-supply.svg", "系统方案设计与深化配合", "配合设计院、总包和施工单位进行系统深化与资料确认。"],
  ["/assets/icons/adv-overseas.svg", "原厂设备供应与跨境交付", "支持国内项目供货与海外 EPC 项目的英文资料、物流和交付协调。"],
  ["/assets/icons/adv-lifecycle.svg", "现场技术支持与运维服务", "提供安装指导、技术答疑、运行维护和后续备件支持。"]
];

export default function ServicesPage() {
  return (
    <>
      <nav className="breadcrumb container" aria-label="breadcrumb">
        <ol>
          <li>
            <Link href="/">首页</Link>
          </li>
          <li>技术与服务</li>
        </ol>
      </nav>

      <div className="hero hero-compact">
        <div className="container hero-inner">
          <div className="hero-eyebrow">技术与服务</div>
          <h1>从选型到落地的全流程支持</h1>
          <p>围绕产品、方案、供货、施工和运维，为项目提供连续的技术服务能力。</p>
        </div>
      </div>

      <main className="container" style={{ paddingBottom: 64 }}>
        <section className="section" style={{ paddingTop: 20 }}>
          <div className="scenario-grid">
            {services.map(([icon, title, desc]) => (
              <article className="scenario-card" key={title}>
                <div>
                  <div className="icon-wrap">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt="" src={icon} />
                  </div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
                <Link href="/contact">获取技术支持 →</Link>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <h2>标准服务流程</h2>
              <p>从需求到报价与供货落地，一共 5 步</p>
            </div>
          </div>
          <div className="process-steps">
            {["需求沟通", "方案选型", "报价确认", "供货交付", "技术落地"].map(
              (item, index) => (
                <div className="process-step" key={item}>
                  <div className="step-num">{index + 1}</div>
                  <h4>{item}</h4>
                  <p>工程师跟进并确认当前阶段所需资料与下一步动作</p>
                </div>
              )
            )}
          </div>
        </section>
      </main>
    </>
  );
}
