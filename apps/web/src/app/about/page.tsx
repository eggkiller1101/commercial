import Link from "next/link";

import { getRequestDictionary } from "@/lib/i18n/server";

export default async function AboutPage() {
  const { dictionary } = await getRequestDictionary();
  const t = dictionary.staticPages.about;
  const common = dictionary.common;
  const home = dictionary.home;

  return (
    <>
      <nav className="breadcrumb container" aria-label="breadcrumb">
        <ol>
          <li>
            <Link href="/">{common.home}</Link>
          </li>
          <li>{t.breadcrumb}</li>
        </ol>
      </nav>

      <div className="hero hero-compact">
        <div className="container hero-inner">
          <span className="partner-badge">
            <span className="dot" />
            {home.heroBadge}
          </span>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
      </div>

      <main className="container" style={{ paddingBottom: 64 }}>
        <section className="section" id="about-intro" style={{ paddingTop: 20 }}>
          <div className="about-grid">
            <div className="about-copy">
              <p>
                云工智上（北京）科技有限公司是一家面向国内及海外国际工程项目、专注高端消防管道系统与工业流体管道整体解决方案的专业化技术服务型企业。公司深耕消防机电、工业建设、市政基建、海外总包、智慧建筑、能源工程、交通商旅配套等领域。
              </p>
              <p>
                公司为<strong>唯特利 Victaulic®</strong>
                官方授权合作代理商，全权负责唯特利全系列沟槽管件、消防阀门、喷淋系统、管道预制系统等产品的销售、方案设计、项目配套及技术落地服务。
              </p>
              <p>
                公司具备成熟的能源、商旅交通项目落地经验与完善外贸供应链，是国内为数不多可同步承接国内酒店、机场、油气储运、石油化工工程，以及中国企业出海同类总包项目的唯特利专业服务商。
              </p>
              <div className="tag-badge-list">
                {[
                  "消防机电",
                  "工业建设",
                  "市政基建",
                  "海外总包",
                  "智慧建筑",
                  "能源工程",
                  "交通商旅配套"
                ].map((tag) => (
                  <span className="tag-badge" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="about-side">
              <h4>核心生产与研发支撑（唯特利大连基地）</h4>
              <ul>
                <li>
                  <strong>成立时间</strong>
                  <span>2005 年成立，2010 年追加投资扩产</span>
                </li>
                <li>
                  <strong>厂区规模</strong>
                  <span>占地 37,000 ㎡，员工 400 余人</span>
                </li>
                <li>
                  <strong>核心产品</strong>
                  <span>沟槽卡箍、消防管件、喷淋头、喷淋软管</span>
                </li>
                <li>
                  <strong>研发中心</strong>
                  <span>美国之外首家海外亚太研发中心（ARDC）</span>
                </li>
                <li>
                  <strong>供应网络</strong>
                  <span>亚洲消防管道产品核心供应枢纽，产品远销全球</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <h2>{t.historyTitle}</h2>
              <p>{t.historyDesc}</p>
            </div>
          </div>
          <div className="timeline">
            {[
              ["1925", "唯特利 Victaulic® 品牌创立，开创沟槽式机械管道连接技术。"],
              ["2005", "唯特利大连生产研发基地成立，成为美国之外首家海外亚太研发中心（ARDC）所在地。"],
              ["2010", "大连基地追加投资扩产，占地扩展至 37,000 ㎡，员工规模超 400 人，成为亚洲消防管道产品核心供应枢纽。"],
              ["现在", "云工智上（北京）科技有限公司成为唯特利官方授权合作代理商，为国内及出海工程项目提供全周期技术服务。"]
            ].map(([year, text]) => (
              <div className="timeline-item" key={year}>
                <div className="year">{year}</div>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <h2>{t.certTitle}</h2>
              <p>{t.certDesc}</p>
            </div>
          </div>
          <div className="cert-badge-grid">
            {[
              "CCCF",
              "CCS",
              "FM",
              "UL",
              "LPCB",
              "VdS",
              "欧盟 PED",
              "ISO 9001",
              "CE",
              "API",
              "ABS",
              "DNV"
            ].map((item) => (
              <div className="cert-badge" key={item}>
                {item}
              </div>
            ))}
          </div>
          <p className="text-muted" style={{ fontSize: 12, marginTop: 12 }}>
            {t.certNote}
          </p>
        </section>

        <section className="section">
          <div
            className="inquiry-card"
            style={{
              alignItems: "center",
              display: "flex",
              flexWrap: "wrap",
              gap: 24,
              justifyContent: "space-between"
            }}
          >
            <div>
              <h3 style={{ fontSize: 16, marginBottom: 6 }}>
                {t.ctaTitle}
              </h3>
              <p className="text-muted">
                {t.ctaDesc}
              </p>
            </div>
            <Link className="btn btn-primary" href="/contact">
              {common.contactUs}
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
