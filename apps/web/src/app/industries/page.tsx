import Link from "next/link";

const industries = [
  ["/assets/icons/scenario-hospitality.svg", "商旅交通建筑", "酒店、机场、会展中心、商业综合体等消防机电场景。"],
  ["/assets/icons/scenario-energy.svg", "能源核心场景", "能源工程、工业厂区和高危复杂工况管道系统方案。"],
  ["/assets/icons/scenario-industrial.svg", "通用工业与市政基建", "市政基建、智慧建筑、园区管网和工业流体系统。"],
  ["/assets/icons/scenario-global.svg", "海外 EPC", "跨境供货、英文技术资料、海外现场技术落地与项目协调。"]
];

export default function IndustriesPage() {
  return (
    <>
      <nav className="breadcrumb container" aria-label="breadcrumb">
        <ol>
          <li>
            <Link href="/">首页</Link>
          </li>
          <li>行业应用</li>
        </ol>
      </nav>

      <div className="hero hero-compact">
        <div className="container hero-inner">
          <div className="hero-eyebrow">行业应用</div>
          <h1>覆盖多类型复杂工程场景</h1>
          <p>从商旅交通建筑到海外 EPC，围绕消防管道系统与工业流体管道提供整体解决方案。</p>
        </div>
      </div>

      <main className="container" style={{ paddingBottom: 64 }}>
        <section className="section" style={{ paddingTop: 20 }}>
          <div className="scenario-grid">
            {industries.map(([icon, title, desc]) => (
              <article className="scenario-card" key={title}>
                <div>
                  <div className="icon-wrap">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt="" src={icon} />
                  </div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
                <Link href="/contact">咨询场景方案 →</Link>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
