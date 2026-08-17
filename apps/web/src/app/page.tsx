import Link from "next/link";

import { getFeaturedProducts } from "@/features/products/data";

export default async function HomePage() {
  const products = await getFeaturedProducts();

  return (
    <>
      <div className="data-source-banner">
        <strong>实时数据</strong> · 当前页面数据来自真实 Supabase 项目
      </div>

      <div className="hero">
        <div className="container hero-inner">
          <span className="partner-badge">
            <span className="dot" />
            <span>唯特利 Victaulic® 官方授权合作代理商</span>
          </span>
          <h1>品质全球化 · 服务全周期 · 工程零风险</h1>
          <p>
            专注高端消防管道系统与工业流体管道整体解决方案，立足北京、辐射全国、布局全球。为酒店、机场、大型公建、能源工业厂区及跨境工程项目，提供国际标准原厂设备、成套系统设计、跨境供货、海外现场技术落地与全周期运维一体化服务。
          </p>
          <div className="hero-actions">
            <Link className="btn btn-secondary" href="#products">
              主推产品
            </Link>
            <Link
              className="btn btn-outline"
              href="#video"
              style={{
                background: "rgba(255,255,255,.08)",
                borderColor: "rgba(255,255,255,.4)",
                color: "#fff"
              }}
            >
              观看公司介绍视频
            </Link>
            <Link
              className="btn btn-outline"
              href="/contact"
              style={{
                background: "rgba(255,255,255,.08)",
                borderColor: "rgba(255,255,255,.4)",
                color: "#fff"
              }}
            >
              联系我们
            </Link>
          </div>
        </div>
      </div>

      <main>
        <div className="container">
          <section className="section" id="about">
            <div className="section-head">
              <div>
                <h2>公司介绍</h2>
                <p>云工智上（北京）科技有限公司</p>
              </div>
            </div>
            <div className="about-grid">
              <div className="about-copy">
                <p className="about-lede">
                  专注高端消防管道系统、工业流体管道整体解决方案的专业化技术服务型企业
                </p>
                <p>
                  云工智上（北京）科技有限公司是一家面向国内及海外国际工程项目、专注高端消防管道系统与工业流体管道整体解决方案的专业化技术服务型企业。公司深耕消防机电、工业建设、市政基建、海外总包、智慧建筑、能源工程、交通商旅配套等领域。
                </p>
                <p>
                  公司为<strong>唯特利 Victaulic®</strong>
                  官方授权合作代理商，全权负责唯特利全系列沟槽管件、消防阀门、喷淋系统、管道预制系统等产品的销售、方案设计、项目配套及技术落地服务。
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

          <section className="section" id="video">
            <div className="section-head">
              <div>
                <h2>公司介绍视频</h2>
                <p>了解云工智上与唯特利的全球合作体系</p>
              </div>
            </div>
            <div className="video-frame">
              <div className="video-placeholder">
                <div className="play-btn">▶</div>
                <strong>公司介绍视频预留位</strong>
                <p>等有实拍视频后，可替换为真实播放器</p>
                <p className="hint">支持视频文件或 CDN 直链</p>
              </div>
            </div>
          </section>

          <section className="section" id="products">
            <div className="section-head">
              <div>
                <h2>主推产品</h2>
                <p>唯特利授权全系列沟槽卡箍、管件、阀门与喷淋系统产品</p>
              </div>
              <Link className="view-all" href="/products">
                进入产品中心 →
              </Link>
            </div>
            <div className="product-grid">
              {products.map((product) => (
                <article className="product-card" key={product.id}>
                  <Link className="thumb" href={`/products/${product.slug}`}>
                    {product.isFeatured ? (
                      <span className="badge badge-featured">重点推荐</span>
                    ) : null}
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img alt={product.name} src={product.imageUrl} />
                    ) : (
                      <span className="text-muted">暂无图片</span>
                    )}
                  </Link>
                  <div className="body">
                    <span className="model-number">{product.modelNumber}</span>
                    <h3>{product.name}</h3>
                    <p className="summary">{product.summary || ""}</p>
                    <div className="card-actions">
                      <Link
                        className="btn btn-outline btn-sm"
                        href={`/products/${product.slug}`}
                      >
                        查看详情
                      </Link>
                      <Link
                        className="btn btn-add-cart btn-sm"
                        href={`/quote-cart?productId=${product.id}`}
                      >
                        + 加入清单
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="section" id="contact">
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
                <h3 style={{ fontSize: 18, marginBottom: 6 }}>
                  需要产品选型或技术支持？
                </h3>
                <p className="text-muted">
                  进入任意产品详情页即可加入询价清单，或直接前往联系我们页面提交项目咨询；工程师会在 1 个工作日内与您联系，国际项目支持全英文对接。
                </p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                <Link className="btn btn-primary" href="/products">
                  浏览产品中心
                </Link>
                <Link className="btn btn-primary" href="/contact">
                  联系我们
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
