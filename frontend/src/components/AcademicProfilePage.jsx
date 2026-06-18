import { academicProfileGroups } from "../content/siteContent.js";
import PageShell from "./PageShell.jsx";

function AcademicProfilePage() {
  return (
    <PageShell
      eyebrow="Study & Skills"
      title="What I have studied, practised, and kept building."
      intro="A factual view of my studies, exam results, languages, technical learning, and areas of curiosity."
      actions={<a className="text-button" href="/cv">Open CV</a>}
    >
      <section className="profile-grid section-shell" aria-label="Study and skills details">
        {academicProfileGroups.map((group) => (
          <article className="profile-card" key={group.title}>
            <h2>{group.title}</h2>
            {group.body && <p>{group.body}</p>}
            {group.items && (
              <dl>
                {group.items.map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {group.tags && (
              <ul className="tag-list">
                {group.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </section>
    </PageShell>
  );
}

export default AcademicProfilePage;
