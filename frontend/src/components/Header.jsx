function Header({ href = "#top" }) {
  return (
    <header className="site-header">
      <a className="brand" href={href} aria-label="Atila home">
        ATILA
      </a>
    </header>
  );
}

export default Header;
