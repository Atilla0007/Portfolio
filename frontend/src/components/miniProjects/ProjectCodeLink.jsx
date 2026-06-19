import { safeExternalUrl } from "../../utils/safeUrl.js";

function ProjectCodeLink({ href }) {
  const safeHref = safeExternalUrl(href, { allowHttp: false });
  if (!safeHref) {
    return null;
  }

  return (
    <a
      className="project-code-link"
      href={safeHref}
      target="_blank"
      rel="noopener noreferrer"
    >
      View Python Code on GitHub
    </a>
  );
}

export default ProjectCodeLink;
