const STEPS = [
  {
    title: "Intro & Splash",
    description: "Kort velkomstskærm med LineUp-branding og auto-advance.",
  },
  {
    title: "Koncept-slider",
    description: "3 slides der forklarer platformen før man går videre.",
  },
  {
    title: "Signup",
    description:
      "Email, adgangskode og sociale loginmuligheder med Zod-validering.",
  },
  {
    title: "Brugertype",
    description:
      "Vælg 'Jeg er musiker' for at fortsætte (andre roller deaktiv.)",
  },
  {
    title: "Basisoplysninger",
    description: "Navn, telefon, fødselsår, lokation med auto-complete.",
  },
  {
    title: "Jeg leder efter",
    description: "Vælg 1-4 mål for platformen; bliver vist på profilen.",
  },
];

export default function Page() {
  return (
    <main className="space-y-6">
      <header className="space-y-2 text-center">
        <p className="text-sm uppercase tracking-widest text-grey">
          Onboarding
        </p>
        <h1 className="text-h1 font-semibold text-foreground">
          Komplet onboarding-flow
        </h1>
        <p className="text-body text-grey">
          Hver step validerer data og gemmer i Zustand, så brugeren kan hoppe
          frem og tilbage uden at miste input.
        </p>
      </header>
      <ol className="space-y-4">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="rounded-2xl border border-light-grey bg-light-grey/30 p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-grey">
              Step {index + 1}
            </p>
            <h2 className="text-h3 font-semibold text-foreground">
              {step.title}
            </h2>
            <p className="text-sm text-grey">{step.description}</p>
          </li>
        ))}
      </ol>
      <button className="w-full rounded-2xl bg-black py-3 text-sm font-semibold text-white transition hover:opacity-80">
        Start onboarding (placeholder)
      </button>
    </main>
  );
}
