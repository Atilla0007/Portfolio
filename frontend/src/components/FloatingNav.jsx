const navItems = [
  { href: "#about", label: "About" },
  { href: "#certificates", label: "Achievements" },
  { href: "#contact", label: "Contact" },
];

function FloatingNav({ items = navItems }) {
  return (
    <nav className="floating-nav" aria-label="Section navigation">
      {items.map((item) => (
        <a key={item.href} href={item.href}>
          {item.label}
        </a>
      ))}
    </nav>
  );
}

export default FloatingNav;
