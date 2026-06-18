import footerLogo from "../assets/images/atila-logo-footer.png";
import { footerLinks } from "../content/siteContent.js";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-logo-wrap" aria-label="Atila identity">
        <img src={footerLogo} alt="ATILA" />
      </div>
      <nav className="footer-nav" aria-label="Footer navigation">
        {footerLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            download={link.isDownload ? true : undefined}
            aria-label={link.isDownload ? `${link.label} PDF` : undefined}
          >
            {link.label}
          </a>
        ))}
      </nav>
      <div className="footer-meta">
        <span>&copy; Atila Hatefi</span>
        <span>Economics, computing, and curiosity</span>
        <span>Tabriz, Iran</span>
      </div>
    </footer>
  );
}

export default Footer;
