import PageShell from "../PageShell.jsx";

function MiniProjectLayout({ title, subtitle, children }) {
  return (
    <PageShell
      eyebrow="Mini Project 01 / Economics + Python"
      title={title}
      intro={subtitle}
      actions={
        <a className="text-button" href="/mini-projects">
          All mini projects
        </a>
      }
    >
      <div className="mini-project-page">{children}</div>
    </PageShell>
  );
}

export default MiniProjectLayout;
