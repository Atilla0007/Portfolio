import { SITE_URL } from "../content/siteContent.js";

function setPageMeta(meta) {
  if (!meta || typeof document === "undefined") {
    return;
  }

  const title = meta.title || "Atila Hatefi";
  const description = meta.description || "";
  const url = `${SITE_URL}${meta.path || "/"}`;

  document.title = title;
  setMeta("description", description);
  setMeta("og:title", meta.ogTitle || title, "property");
  setMeta("og:description", meta.ogDescription || description, "property");
  setMeta("og:url", url, "property");
  setMeta("og:type", meta.type || "website", "property");
  setCanonical(url);
}

function setMeta(name, content, attr = "name") {
  if (!content) {
    return;
  }

  let element = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attr, name);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function setCanonical(url) {
  let element = document.head.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }
  element.setAttribute("href", url);
}

export { setPageMeta };
