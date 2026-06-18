import { activitiesGroups } from "../content/siteContent.js";
import PageShell from "./PageShell.jsx";

function ActivitiesPage() {
  return (
    <PageShell
      eyebrow="Activities"
      title="Discipline, teamwork, and curiosity outside study."
      intro="Sports, technology, music, travel, and strategy are part of how I learn, reset, and understand people."
    >
      <section className="editorial section-shell">
        {activitiesGroups.map((group) => (
          <article className="editorial-section" key={group.title}>
            <h2>{group.title}</h2>
            {group.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </article>
        ))}
      </section>
    </PageShell>
  );
}

export default ActivitiesPage;
