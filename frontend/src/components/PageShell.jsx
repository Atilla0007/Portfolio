function PageShell({ eyebrow, title, intro, children, actions }) {
  return (
    <main className="subpage">
      <section className="subpage-hero section-shell">
        <a className="back-home-link" href="/">
          Back home
        </a>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {intro && <p className="subpage-intro">{intro}</p>}
        {actions && <div className="subpage-actions">{actions}</div>}
      </section>
      {children}
    </main>
  );
}

export default PageShell;
