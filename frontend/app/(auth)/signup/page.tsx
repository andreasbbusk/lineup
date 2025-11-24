import Link from "next/link";

export default function Page() {
  return (
    <main className="space-y-6">
      <header className="space-y-2 text-center">
        <p className="text-sm uppercase tracking-widest text-grey">
          Kom i gang
        </p>
        <h1 className="text-h1 font-semibold text-foreground">Opret profil</h1>
        <p className="text-body text-grey">
          Skab din LineUp-konto og begynd at finde nye samarbejder.
        </p>
      </header>
      <div className="space-y-3">
        <button className="w-full rounded-2xl border border-light-grey py-3 text-sm font-semibold text-foreground">
          Social login (placeholder)
        </button>
        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-light-grey" />
          <span className="text-xs uppercase tracking-widest text-grey">
            eller
          </span>
          <span className="h-px flex-1 bg-light-grey" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Email</label>
          <div className="rounded-2xl border border-light-grey bg-light-grey/50 px-4 py-3 text-sm text-grey">
            Inputfelt kommer her
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Adgangskode
          </label>
          <div className="rounded-2xl border border-light-grey bg-light-grey/50 px-4 py-3 text-sm text-grey">
            Inputfelt kommer her
          </div>
        </div>
        <button className="w-full rounded-2xl bg-crocus-yellow py-3 text-sm font-semibold text-black transition hover:opacity-90">
          Opret profil
        </button>
      </div>
      <div className="text-center text-sm text-grey">
        Har du allerede en konto?{" "}
        <Link
          href="/login"
          className="font-semibold text-blackberry-harvest transition hover:opacity-80"
        >
          Log ind
        </Link>
      </div>
    </main>
  );
}
