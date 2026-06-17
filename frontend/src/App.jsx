import About from "./components/About.jsx";
import Certificates from "./components/Certificates.jsx";
import Contact from "./components/Contact.jsx";
import FloatingNav from "./components/FloatingNav.jsx";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import NotFound, { notFoundNavItems } from "./components/NotFound.jsx";

function isPortfolioHome() {
  const pathname = globalThis.location?.pathname || "/";
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";

  return normalizedPath === "/" || normalizedPath === "/index.html";
}

function App() {
  const isHome = isPortfolioHome();
  const path = globalThis.location?.pathname || "";

  if (!isHome) {
    return (
      <>
        <Header href="/" />
        <NotFound path={path} />
        <Footer />
        <FloatingNav items={notFoundNavItems} />
      </>
    );
  }

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

export default App;
