import heroPortrait from "../assets/images/atila-portrait-hero.jpg";

const metadata = [
  ["From", "Tabriz, Iran"],
  ["Direction", "Economics and evidence"],
  ["Tools", "Python / Django / React"],
  ["Curious About", "Markets, AI, culture"],
];

function Hero() {
  return (
    <section className="hero section-shell" id="top" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow">Personal portfolio / economics, computing, curiosity</p>
        <h1 id="hero-title">
          I study systems, decisions, and the evidence behind them.
        </h1>
        <p className="hero-subtitle">
          I am Atila Hatefi, a student from Tabriz interested in Economics,
          quantitative thinking, programming, technology, sports, music, and the
          way people make decisions under uncertainty.
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
