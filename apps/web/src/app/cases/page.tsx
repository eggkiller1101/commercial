import Link from "next/link";

import { getPublishedCases } from "@/features/cases/data";

const fallbackCases = [
  ["✈️", "商旅交通建筑", "华东某国际机场航站楼消防系统改造", "为航站楼候机区、行李分拣区提供沟槽式消防管路系统整体解决方案。"],
  ["🏨", "商旅交通建筑", "华南高端酒店集群消防喷淋系统供货", "为多栋高端酒店客房与公共区域提供喷淋头及配套阀组。"],
  ["⚡", "能源核心场景", "西北 LNG 接收站管路连接系统", "为 LNG 接收站长输管线提供高压力等级沟槽式管件与法兰接头。"],
  ["🛢️", "能源核心场景", "华北炼化一体化项目管路配套", "为炼化园区厂区管路提供成套沟槽连接产品与法兰过渡件。"],
  ["🏗️", "通用工业与市政基建", "华中市政给排水管网升级工程", "针对大直径埋地给排水管路，提供标准化沟槽卡箍与异径接头。"],
  ["🌏", "海外 EPC", "东南亚工业园区消防系统总包配套", "为中国企业出海总包项目提供全英文技术资料与海外驻场技术指导。"]
];

export default async function CasesPage() {
  const cases = await getPublishedCases();

  return (
    <>
      <nav className="breadcrumb container" aria-label="breadcrumb">
        <ol>
          <li>
            <Link href="/">首页</Link>
          </li>
          <li>项目案例</li>
        </ol>
      </nav>

      <div className="hero hero-compact">
        <div className="container hero-inner">
          <div className="hero-eyebrow">项目案例</div>
          <h1>代表性工程场景与项目经验</h1>
          <p>覆盖商旅交通建筑、能源核心场景、通用工业与市政基建、海外 EPC 等项目类型。</p>
        </div>
      </div>

      <main className="container" style={{ paddingBottom: 64 }}>
        <section className="section" style={{ paddingTop: 20 }}>
          <div className="resource-filter-bar" id="case-filter-bar">
            <button className="is-active" type="button">
              全部案例
            </button>
            <button type="button">商旅交通建筑</button>
            <button type="button">能源核心场景</button>
            <button type="button">通用工业与市政基建</button>
            <button type="button">海外 EPC</button>
          </div>

          <div className="case-card-grid" id="case-grid">
            {cases.length
              ? cases.map((caseItem) => (
                  <div className="case-card" key={caseItem.id}>
                    <div className="case-thumb">🏗️</div>
                    <div className="case-body">
                      <span className="case-tag">{caseItem.author || "项目案例"}</span>
                      <h3>{caseItem.title}</h3>
                      <p>{caseItem.summary || caseItem.content || "暂无案例简介"}</p>
                    </div>
                  </div>
                ))
              : fallbackCases.map(([icon, tag, title, desc]) => (
                  <div className="case-card" key={title}>
                    <div className="case-thumb">{icon}</div>
                    <div className="case-body">
                      <span className="case-tag">{tag}</span>
                      <h3>{title}</h3>
                      <p>{desc}</p>
                    </div>
                  </div>
                ))}
          </div>
        </section>
      </main>
    </>
  );
}
