function ProjectExplanation({ number, title, children, className = "" }) {
  return (
    <section className={`project-explanation section-shell ${className}`.trim()}>
      <div className="project-explanation-label">({number}) {title}</div>
      <div className="project-explanation-content">{children}</div>
    </section>
  );
}

export default ProjectExplanation;
