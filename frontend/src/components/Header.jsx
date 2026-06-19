import { headerLinks } from "../content/siteContent.js";

function Header({ href = "#top" }) {
  return (
    <header className="site-header">
      <a className="brand" href={href} aria-label="Atila home">
        ATILA
      </a>
      <nav className="header-nav" aria-label="Primary navigation">
        {headerLinks.map((link) => (
          <a href={link.href} key={link.href}>{link.label}</a>
        ))}
      </nav>
    </header>
  );
}

export default Header;
