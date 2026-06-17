import portraitUrl from "../assets/images/atila-portrait-hero.jpg";

const notFoundNavItems = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

function NotFound({ path = "" }) {
  const cleanPath = path || "Unknown page";

  return (
    <main className="not-found-page">
      <section className="not-found section-shell" aria-labelledby="not-found-title">
        <div className="not-found-stage" aria-hidden="true">
          <img className="not-found-fragment" src={portraitUrl} alt="" />
          <div className="not-found-code" data-text="404">
            404
          </div>
          <span className="not-found-marker not-found-marker-one">route / null</span>
          <span className="not-found-marker not-found-marker-two">signal: broken</span>
          <span className="not-found-marker not-found-marker-three">index: missing</span>
        </div>
        <div className="not-found-copy">
          <p className="eyebrow">Page not found</p>
          <h1 id="not-found-title">This route slipped through the portfolio grid.</h1>
          <p>
            The page you opened is not mapped here. Head back to the portfolio, or send a ticket if
            you expected something to be live.
          </p>
          <div className="not-found-actions" aria-label="404 page actions">
            <a href="/">Back home</a>
            <a href="/#contact">Contact</a>
          </div>
        </div>
        <dl className="not-found-meta" aria-label="Missing page details">
          <div className="meta-item">
            <dt>Status</dt>
            <dd>404</dd>
          </div>
          <div className="meta-item">
            <dt>Path</dt>
            <dd>{cleanPath}</dd>
          </div>
          <div className="meta-item">
            <dt>Next step</dt>
            <dd>
              <a className="not-found-meta-link" href="/">
                Return home
              </a>
            </dd>
          </div>
        </dl>
      </section>
    </main>
  );
}

export { notFoundNavItems };
export default NotFound;
