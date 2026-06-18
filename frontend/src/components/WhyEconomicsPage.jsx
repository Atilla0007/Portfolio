import { whyEconomics } from "../content/siteContent.js";
import PageShell from "./PageShell.jsx";

function WhyEconomicsPage() {
  return (
    <PageShell
      eyebrow={whyEconomics.eyebrow}
      title={whyEconomics.title}
      intro={whyEconomics.intro}
      actions={<a className="text-button" href="/study-and-skills">View study & skills</a>}
    >
      <section className="editorial section-shell">
        <blockquote>{whyEconomics.pullQuote}</blockquote>
        {whyEconomics.sections.map((section) => (
          <article className="editorial-section" key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </article>
        ))}
      </section>
    </PageShell>
  );
}

export default WhyEconomicsPage;
