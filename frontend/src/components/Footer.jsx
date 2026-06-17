import footerLogo from "../assets/images/atila-logo-footer.png";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-logo-wrap" aria-label="Atila identity">
        <img src={footerLogo} alt="ATILA" />
      </div>
      <div className="footer-meta">
        <span>&copy; Atila Hatefi</span>
        <span>Backend Developer</span>
        <span>Tabriz, Iran</span>
      </div>
    </footer>
  );
}

export default Footer;
