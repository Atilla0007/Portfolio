const HOME_SECTIONS = ["about", "certificates", "contact"];

function normalizePath(pathname = "/") {
  const path = pathname.split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";
  return path === "/index.html" ? "/" : path;
}

function resolveRoute(pathname = "/") {
  const path = normalizePath(pathname);

  if (path === "/") {
    return { name: "home", path };
  }
  if (path === "/why-economics") {
    return { name: "whyEconomics", path };
  }
  if (path === "/study-and-skills" || path === "/academic-profile") {
    return { name: "academicProfile", path };
  }
  if (path === "/activities") {
    return { name: "activities", path };
  }
  if (path === "/cv") {
    return { name: "cv", path };
  }
  if (path === "/mini-projects") {
    return { name: "miniProjects", path };
  }
  if (path === "/mini-projects/inflation-purchasing-power") {
    return { name: "inflationProject", path };
  }
  if (path === "/mini-projects/interest-compound-growth-inflation") {
    return { name: "interestInflationProject", path };
  }
  if (path === "/notes" || path === "/blog") {
    return { name: "blog", path };
  }
  if (path.startsWith("/notes/") || path.startsWith("/blog/")) {
    const slug = path.replace(/^\/(notes|blog)\//, "");
    return slug ? { name: "blogPost", path, slug } : { name: "notFound", path };
  }

  return { name: "notFound", path };
}

function isBackendRoute(pathname = "/") {
  return /^\/(api|go-to-settings|admin|static|media|health)(\/|$)/.test(normalizePath(pathname));
}

export { HOME_SECTIONS, isBackendRoute, normalizePath, resolveRoute };
