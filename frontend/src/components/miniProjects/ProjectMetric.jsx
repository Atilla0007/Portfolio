function ProjectMetric({ label, value, detail }) {
  return (
    <article className="project-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
    </article>
  );
}

export default ProjectMetric;
