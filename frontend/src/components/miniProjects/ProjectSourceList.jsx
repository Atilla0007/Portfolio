import { safeExternalUrl } from "../../utils/safeUrl.js";

function ProjectSourceList({ sources }) {
  const safeSources = sources
    .map((source) => ({ ...source, url: safeExternalUrl(source.url, { allowHttp: false }) }))
    .filter((source) => source.url);

  return (
    <ul className="project-source-list">
      {safeSources.map((source) => (
        <li key={source.url}>
          <strong>{source.name}</strong>
          {source.detail && <span>{source.detail}</span>}
          <a href={source.url} target="_blank" rel="noopener noreferrer">
            Open official source
          </a>
        </li>
      ))}
    </ul>
  );
}

export default ProjectSourceList;
