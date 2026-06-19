import { useEffect } from "react";

import About from "./components/About.jsx";
import AcademicProfilePage from "./components/AcademicProfilePage.jsx";
import ActivitiesPage from "./components/ActivitiesPage.jsx";
import { BlogIndexPage, BlogPostPage } from "./components/BlogPages.jsx";
import Certificates from "./components/Certificates.jsx";
import Contact from "./components/Contact.jsx";
import CVPage from "./components/CVPage.jsx";
import FloatingNav from "./components/FloatingNav.jsx";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import NotFound, { notFoundNavItems } from "./components/NotFound.jsx";
import WhyEconomicsPage from "./components/WhyEconomicsPage.jsx";
import InflationPurchasingPowerPage from "./components/miniProjects/InflationPurchasingPowerPage.jsx";
import InterestInflationPage from "./components/miniProjects/InterestInflationPage.jsx";
import MiniProjectsIndex from "./components/miniProjects/MiniProjectsIndex.jsx";
import { pageMeta } from "./content/siteContent.js";
import { resolveRoute } from "./utils/routes.js";
import { setPageMeta } from "./utils/seo.js";

function App() {
  const path = globalThis.location?.pathname || "";
  const route = resolveRoute(path);

  useEffect(() => {
    if (route.name !== "blogPost") {
      setPageMeta(pageMeta[route.name] || pageMeta.notFound);
    }
  }, [route.name]);

  if (route.name === "home") {
    return (
      <>
        <Header />
        <main>
          <Hero />
          <About />
          <Certificates />
          <Contact />
        </main>
        <Footer />
        <FloatingNav />
      </>
    );
  }

  const page = renderRoute(route, path);

  return (
    <>
      <Header href="/" />
      {page}
      <Footer />
      <FloatingNav items={notFoundNavItems} />
    </>
  );
}

function renderRoute(route, path) {
  switch (route.name) {
    case "whyEconomics":
      return <WhyEconomicsPage />;
    case "academicProfile":
      return <AcademicProfilePage />;
    case "activities":
      return <ActivitiesPage />;
    case "cv":
      return <CVPage />;
    case "miniProjects":
      return <MiniProjectsIndex />;
    case "inflationProject":
      return <InflationPurchasingPowerPage />;
    case "interestInflationProject":
      return <InterestInflationPage />;
    case "blog":
      return <BlogIndexPage />;
    case "blogPost":
      return <BlogPostPage slug={route.slug} />;
    default:
      return <NotFound path={path} />;
  }
}

export default App;
