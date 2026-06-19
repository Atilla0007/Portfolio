import { useEffect, useState } from "react";

import { pageMeta } from "../content/siteContent.js";
import { normalizeBlogPost, parseArticleBody } from "../utils/blog.js";
import { safeExternalUrl } from "../utils/safeUrl.js";
import { setPageMeta } from "../utils/seo.js";
import PageShell from "./PageShell.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const BLOG_ENDPOINT = `${API_BASE_URL}/api/blog/`;

function BlogIndexPage() {
  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let isMounted = true;

    async function loadPosts() {
      try {
        const response = await fetch(BLOG_ENDPOINT);
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const data = await response.json();
        if (isMounted) {
          setPosts((Array.isArray(data) ? data : data.results || []).map(normalizeBlogPost).filter(Boolean));
          setStatus("success");
        }
      } catch {
        if (isMounted) {
          setStatus("error");
        }
      }
    }

    loadPosts();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <PageShell
      eyebrow="Notes"
      title="Writing on economics, computing, and evidence."
      intro="Personal notes on the questions I keep returning to: markets, data, technology, judgment, and uncertainty."
    >
      <section className="blog-list section-shell" aria-label="Notes">
        {status === "loading" && <div className="state-line">Loading notes...</div>}
        {status === "error" && (
          <div className="state-line state-line-error">Notes could not load. Please try again later.</div>
        )}
        {status === "success" && posts.length === 0 && (
          <div className="state-line">Published notes will appear here soon.</div>
        )}
        {status === "success" &&
          posts.map((post) => (
            <article className="blog-card" key={post.slug}>
              <div className="certificate-meta">
                <span>{post.category}</span>
                <span>{post.estimated_reading_time} min read</span>
              </div>
              <h2>{post.title}</h2>
              <p>{post.excerpt}</p>
              <a className="text-button" href={`/notes/${post.slug}`}>
                Read note
              </a>
            </article>
          ))}
      </section>
    </PageShell>
  );
}

function BlogPostPage({ slug }) {
  const [post, setPost] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let isMounted = true;

    async function loadPost() {
      try {
        const response = await fetch(`${BLOG_ENDPOINT}${slug}/`);
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }
        const data = normalizeBlogPost(await response.json());
        if (isMounted) {
          setPost(data);
          setStatus(data ? "success" : "error");
          if (data) {
            setPageMeta({
              title: data.seo_title || data.title,
              description: data.meta_description || data.excerpt,
              path: `/notes/${data.slug}`,
              type: "article",
            });
          }
        }
      } catch {
        if (isMounted) {
          setStatus("error");
          setPageMeta(pageMeta.notFound);
        }
      }
    }

    loadPost();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (status === "loading") {
    return (
      <PageShell eyebrow="Notes" title="Loading note." intro="Fetching the published note from the portfolio API.">
        <section className="section-shell">
          <div className="state-line">Loading note...</div>
        </section>
      </PageShell>
    );
  }

  if (status === "error" || !post) {
    return (
      <PageShell eyebrow="Notes" title="Note not found." intro="This note is not published or does not exist.">
        <section className="section-shell">
          <a className="text-button" href="/notes">Back to Notes</a>
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow={post.category}
      title={post.title}
      intro={`${post.estimated_reading_time} min read`}
      actions={<a className="text-button" href="/notes">Back to Notes</a>}
    >
      <article className="blog-article section-shell">
        {parseArticleBody(post.body).map((block, index) =>
          block.type === "heading" ? (
            <h2 key={`${block.text}-${index}`}>{block.text}</h2>
          ) : (
            <p key={`${block.text}-${index}`}>{block.text}</p>
          ),
        )}

        {post.key_takeaways.length > 0 && (
          <section className="takeaways" aria-labelledby="takeaways-title">
            <h2 id="takeaways-title">Key Takeaways</h2>
            <ul>
              {post.key_takeaways.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="sources" aria-labelledby="sources-title">
          <h2 id="sources-title">Source List</h2>
          {post.sources.length > 0 ? (
            <ol>
              {post.sources.map((source) => {
                const sourceHref = safeExternalUrl(source.url, { allowHttp: false });
                if (!sourceHref) {
                  return null;
                }
                return (
                  <li key={`${source.label}-${sourceHref}`}>
                    <strong>{source.label}</strong>
                    <span className="source-url">{sourceHref}</span>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p>No external numerical claims or statistics used.</p>
          )}
        </section>
      </article>
    </PageShell>
  );
}

export { BlogIndexPage, BlogPostPage };
