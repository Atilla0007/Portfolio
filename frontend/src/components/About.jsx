const pillars = [
  ["01", "Direction", "Economics and quantitative analysis"],
  ["02", "Foundation", "Mathematics and Physics"],
  ["03", "Tools", "Python, Django, structured systems"],
  ["04", "Perspective", "Tabriz, Türkiye, technology, culture"],
];

function About() {
  return (
    <section className="about section-shell section-grid" id="about">
      <div className="section-kicker">(01) About</div>

      <div className="section-content">
        <h2>Curiosity with structure behind it.</h2>
        <div className="about-copy">
          <p>
            I am Atila Hatefi, a student from Tabriz interested in Economics,
            quantitative thinking, and the way technology can help organise
            evidence more carefully.
          </p>
          <p>
            Growing up in a border city made economic change visible through
            prices, exchange rates, trade, and everyday decisions. Mathematics
            and physics trained me to think with precision, while programming
            taught me to break problems into structure, test assumptions, and
            build working systems. My interests are wider than one subject:
            technology, artificial intelligence, sports, music, travel, and
            strategy all shape how I learn and see the world.
          </p>
        </div>

        <div className="about-links" aria-label="Personal portfolio links">
          <a className="text-button" href="/why-economics">Read why Economics matters to me</a>
          <a className="text-button" href="/study-and-skills">View study & skills</a>
        </div>

        <ol className="studio-list" aria-label="Atila Hatefi focus areas">
          {pillars.map(([number, label, value]) => (
            <li key={number}>
              <span>({number})</span>
              <div>
                <strong>{label}</strong>
                <small>{value}</small>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default About;
