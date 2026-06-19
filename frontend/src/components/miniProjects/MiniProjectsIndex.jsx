import PageShell from "../PageShell.jsx";
import { miniProjects } from "./projectCatalog.js";

function MiniProjectsIndex() {
  return (
    <PageShell
      eyebrow="Economics + Python"
      title="Mini Projects"
      intro="Small, working studies that connect economic questions with data, Python, and careful explanation."
    >
      <section className="mini-project-index section-shell" aria-label="Completed mini projects">
        <div className="mini-project-index-heading">
          <span>Completed work</span>
          <strong>{String(miniProjects.length).padStart(2, "0")}</strong>
        </div>
        <div className="mini-project-list">
          {miniProjects.map((project) => (
            <article className="mini-project-card" key={project.slug}>
              <div className="mini-project-card-meta">
                <span>({project.number})</span>
                <span>{project.status}</span>
              </div>
              <h2>{project.title}</h2>
              <p>{project.subtitle}</p>
              <ul aria-label={`${project.title} technologies`}>
                {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
              </ul>
              <a className="project-card-link" href={project.path}>
                Open project
              </a>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

export default MiniProjectsIndex;
