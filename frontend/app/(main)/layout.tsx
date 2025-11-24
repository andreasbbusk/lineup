import type { ReactNode } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/", label: "Feed" },
  { href: "/search", label: "Søg" },
  { href: "/create", label: "Opret" },
  { href: "/messages", label: "Beskeder" },
  { href: "/profile", label: "Profil" },
];

interface MainLayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: MainLayoutProps) {
  return (
    <section className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-light-grey bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-semibold">
            LineUp
          </Link>
          <div className="flex items-center gap-4 text-sm font-medium">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-grey transition hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
      <div className="mx-auto max-w-5xl px-6 py-8">{children}</div>
    </section>
  );
}
