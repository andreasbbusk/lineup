import Link from "next/link";

export default function Page() {
  return (
    <main className="space-y-6">
      <header className="space-y-2 text-center">
        <p className="text-sm uppercase tracking-widest text-grey">
          Velkommen tilbage
        </p>
        <h1 className="text-h1 font-semibold text-foreground">Log ind</h1>
        <p className="text-body text-grey">
          Få adgang til dine beskeder, opslag og samarbejder.
        </p>
      </header>
      <div className="space-y-4">
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
        <button className="w-full rounded-2xl bg-blackberry-harvest py-3 text-sm font-semibold text-white transition hover:opacity-90">
          Log ind
        </button>
        <Link
          href="#"
          className="block text-center text-sm font-medium text-grey transition hover:text-foreground"
        >
          Glemt adgangskode?
        </Link>
      </div>
      <div className="text-center text-sm text-grey">
        Har du ikke en konto?{" "}
        <Link
          href="/signup"
          className="font-semibold text-blackberry-harvest transition hover:opacity-80"
        >
          Opret profil
        </Link>
      </div>
    </main>
  );
}
