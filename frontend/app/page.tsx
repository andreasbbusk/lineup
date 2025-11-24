import Link from "next/link";

const LINKS = [
  { href: "/login", label: "Log in" },
  { href: "/signup", label: "Sign up" },
  { href: "/onboarding", label: "Onboarding" },
  { href: "/", label: "Feed (main)" },
  { href: "/search", label: "Search" },
  { href: "/create", label: "Create post" },
  { href: "/messages", label: "Messages" },
  { href: "/profile", label: "Profile" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-h1 font-semibold">LineUp</h1>
          <p className="text-body text-grey">
            Quick navigation to the key routes.
          </p>
        </header>

        <section className="rounded-2xl border border-light-grey bg-white p-4">
          <h2 className="text-h3 font-semibold">Navigation</h2>
          <div className="mt-4 grid gap-2">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between rounded-xl border border-light-grey px-4 py-3 text-sm font-medium text-foreground transition hover:bg-light-grey/50"
              >
                <span>{link.label}</span>
                <span className="text-grey">{link.href}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
