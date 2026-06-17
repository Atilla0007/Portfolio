import heroPortrait from "../assets/images/atila-portrait-hero.jpg";

const metadata = [
  ["Location", "Tabriz, Iran"],
  ["Focus", "Backend Development"],
  ["Stack", "Python / Django / React"],
  ["Started", "3+ years ago"],
];

function Hero() {
  return (
    <section className="hero section-shell" id="top" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow">Personal portfolio / backend developer</p>
        <h1 id="hero-title">
          Atila Hatefi &mdash; backend-focused developer building clean,
          functional web experiences.
        </h1>
        <p className="hero-subtitle">
          19-year-old developer from Tabriz, Iran, working mainly with Python,
          Django, React, and modern web technologies.
        </p>
      </div>

      <figure className="hero-portrait">
        <img src={heroPortrait} alt="Editorial portrait of Atila Hatefi" />
      </figure>

      <dl className="hero-meta" aria-label="Atila Hatefi profile metadata">
        {metadata.map(([label, value]) => (
          <div className="meta-item" key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default Hero;
