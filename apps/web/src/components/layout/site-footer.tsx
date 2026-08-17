import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div className="footer-brand">
          <Link className="logo" href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="logo" className="logo-mark" src="/assets/icons/logo-mark.svg" />
            <span className="logo-text">云工智上</span>
          </Link>
          <p>
            专注高端消防管道系统与工业流体管道整体解决方案，提供产品选型、成套供货、技术支持与全周期服务。
          </p>
        </div>

        <div className="footer-col">
          <h4>产品中心</h4>
          <ul>
            <li>
              <Link href="/products">全部产品</Link>
            </li>
            <li>
              <Link href="/quote-cart">上传清单询价</Link>
            </li>
            <li>
              <Link href="/resources">资料中心</Link>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>技术支持</h4>
          <ul>
            <li>
              <Link href="/industries">行业应用</Link>
            </li>
            <li>
              <Link href="/services">技术与服务</Link>
            </li>
            <li>
              <Link href="/cases">项目案例</Link>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>关于我们</h4>
          <ul>
            <li>
              <Link href="/about">公司介绍</Link>
            </li>
            <li>
              <Link href="/contact">联系我们</Link>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>联系方式</h4>
          <ul className="footer-contact-list">
            <li>
              <span className="footer-contact-label">服务热线</span>
              <span className="footer-contact-value">400-000-0000</span>
            </li>
            <li>
              <span className="footer-contact-label">邮箱咨询</span>
              <span className="footer-contact-value">
                sales@cloudintelworks.com
              </span>
            </li>
            <li className="footer-contact-cta">
              <Link href="/contact">在线询价</Link>
            </li>
          </ul>
          <p
            className="text-muted"
            style={{ color: "var(--neutral-400)", fontSize: 12, marginTop: 10 }}
          >
            工程师会在 1 个工作日内与您联系。
          </p>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© 2026 云工智上（北京）科技有限公司. All rights reserved.</span>
      </div>
    </footer>
  );
}
