import Link from "next/link";

import type { Dictionary } from "@/lib/i18n/dictionaries";

export function SiteFooter({ dictionary }: { dictionary: Dictionary }) {
  const t = dictionary.footer;
  const nav = dictionary.nav;

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
            {t.description}
          </p>
        </div>

        <div className="footer-col">
          <h4>{nav.products}</h4>
          <ul>
            <li>
              <Link href="/products">{t.allProducts}</Link>
            </li>
            <li>
              <Link href="/quote-cart">{nav.quote}</Link>
            </li>
            <li>
              <Link href="/resources">{nav.resources}</Link>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>{t.techSupport}</h4>
          <ul>
            <li>
              <Link href="/industries">{nav.industries}</Link>
            </li>
            <li>
              <Link href="/services">{nav.services}</Link>
            </li>
            <li>
              <Link href="/cases">{nav.cases}</Link>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>{t.about}</h4>
          <ul>
            <li>
              <Link href="/about">{t.companyIntro}</Link>
            </li>
            <li>
              <Link href="/contact">{nav.contact}</Link>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>{t.contact}</h4>
          <ul className="footer-contact-list">
            <li>
              <span className="footer-contact-label">{t.serviceHotline}</span>
              <span className="footer-contact-value">400-000-0000</span>
            </li>
            <li>
              <span className="footer-contact-label">{t.email}</span>
              <span className="footer-contact-value">
                sales@cloudintelworks.com
              </span>
            </li>
            <li className="footer-contact-cta">
              <Link href="/contact">{nav.contact}</Link>
            </li>
          </ul>
          <p
            className="text-muted"
            style={{ color: "var(--neutral-400)", fontSize: 12, marginTop: 10 }}
          >
            {t.response}
          </p>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© 2026 云工智上（北京）科技有限公司. All rights reserved.</span>
      </div>
    </footer>
  );
}
