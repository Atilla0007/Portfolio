import { safeExternalUrl } from "./safeUrl.js";

function parseArticleBody(body = "") {
  return body
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      if (block.startsWith("## ")) {
        return { type: "heading", text: block.replace(/^##\s+/, "") };
      }
      return { type: "paragraph", text: block };
    });
}

function safeSources(sources = []) {
  return sources
    .map((source) => ({
      ...source,
      url: safeExternalUrl(source.url),
    }))
    .filter((source) => source.url);
}

function normalizeBlogPost(post) {
  if (!post || typeof post !== "object") {
    return null;
  }

  return {
    ...post,
    key_takeaways: Array.isArray(post.key_takeaways) ? post.key_takeaways : [],
    sources: safeSources(Array.isArray(post.sources) ? post.sources : []),
  };
}

export { normalizeBlogPost, parseArticleBody, safeSources };
