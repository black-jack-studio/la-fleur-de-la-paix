import { Button } from "./Button";

const LINKS = [
  { href: "#maison", label: "La maison" },
  { href: "#compositions", label: "Compositions" },
  { href: "#atelier-visuel", label: "Imaginer" },
  { href: "#devis", label: "Mon devis" },
  { href: "#contact", label: "Contact" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-hairline/70 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4 sm:px-8">
        <a href="#top" className="font-display text-3xl leading-none text-carmine sm:text-[2.1rem]">
          La Fleur de la Paix
        </a>

        <nav className="hidden items-center gap-9 text-[0.82rem] tracking-[0.02em] text-ink-soft md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-carmine"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <Button href="#devis" variant="solid" className="hidden sm:inline-flex">
          Faire mon devis
        </Button>
      </div>
    </header>
  );
}
