import { cvSections } from "../content/siteContent.js";
import PageShell from "./PageShell.jsx";

function CVPage() {
  return (
    <PageShell
      eyebrow="CV"
      title="Atila Hatefi"
      intro="Economics, quantitative thinking, computing, and personal development."
      actions={<a className="text-button" href="/#contact">Contact</a>}
    >
      <section className="cv-preview section-shell" aria-label="CV preview">
        <div className="cv-sheet">
          <header>
            <div>
              <h2>Atila Hatefi</h2>
              <p>Economics, computing, and evidence</p>
            </div>
            <ul>
              <li>atilahatefi.ir</li>
              <li>Email: atilahatefi70@gmail.com</li>
              <li>GitHub: github.com/Atilla0007</li>
              <li>Instagram: @atilahtf</li>
            </ul>
          </header>
          {cvSections.map((section) => (
            <section key={section.title}>
              <h3>{section.title}</h3>
              {section.body && <p>{section.body}</p>}
              {section.items && (
                <ul>
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

export default CVPage;
