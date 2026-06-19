import PageShell from "../PageShell.jsx";
import ProjectCodeLink from "./ProjectCodeLink.jsx";
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
              <dl className="mini-project-card-context">
                <div>
                  <dt>Question</dt>
                  <dd>{project.question}</dd>
                </div>
                <div>
                  <dt>Economics</dt>
                  <dd>{project.economicsConcept}</dd>
                </div>
              </dl>
              <ul aria-label={`${project.title} technologies`}>
                {project.tags.map((tag) => <li key={tag}>{tag}</li>)}
              </ul>
              <div className="project-card-actions">
                <a className="project-card-link" href={project.path}>
                  Open project
                </a>
                <ProjectCodeLink
                  href={project.codeUrl}
                  label="View code"
                  className="project-card-code-link"
                />
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

export default MiniProjectsIndex;
