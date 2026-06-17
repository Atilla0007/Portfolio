const pillars = [
  ["01", "Backend Development"],
  ["02", "Web Interfaces"],
  ["03", "Problem Solving"],
  ["04", "Sports & Discipline"],
];

function About() {
  return (
    <section className="about section-shell section-grid" id="about">
      <div className="section-kicker">(01) About</div>

      <div className="section-content">
        <h2>I build from logic outward.</h2>
        <div className="about-copy">
          <p>
            I&apos;m Atila Hatefi, a 19-year-old backend-focused developer from
            Tabriz, Iran. My background started in mathematics and physics,
            which shaped the way I think about systems, logic, and
            problem-solving. I began learning programming three years ago with
            Python, then expanded into HTML, CSS, JavaScript, React, Django, and
            modern web development.
          </p>
          <p>
            I&apos;m most interested in building clean backend systems,
            practical web applications, and digital products that feel simple on
            the surface but strong underneath. Outside programming, I&apos;m
            into sports like basketball, tennis, eight-ball, and anything
            competitive that keeps me sharp.
          </p>
        </div>

        <ol className="studio-list" aria-label="Atila Hatefi focus areas">
          {pillars.map(([number, label]) => (
            <li key={number}>
              <span>({number})</span>
              <strong>{label}</strong>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default About;
