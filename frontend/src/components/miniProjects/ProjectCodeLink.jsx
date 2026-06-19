import { safeExternalUrl } from "../../utils/safeUrl.js";

function ProjectCodeLink({ href, label = "View Python Code on GitHub", className = "" }) {
  const safeHref = safeExternalUrl(href, { allowHttp: false });
  if (!safeHref) {
    return null;
  }

  return (
    <a
      className={`project-code-link ${className}`.trim()}
      href={safeHref}
      target="_blank"
      rel="noopener noreferrer"
    >
      {label}
    </a>
  );
}

export default ProjectCodeLink;
