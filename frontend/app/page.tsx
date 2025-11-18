export default function Home() {
  return (
    <main className="min-h-screen w-full bg-background p-16">
      <div className="mx-auto max-w-7xl space-y-12">
        <header className="space-y-4">
          <h1 className="text-h1 font-bold text-foreground">
            Design System - Color Variables Test
          </h1>
          <p className="text-body text-grey">
            Testing all custom Tailwind color classes from @theme
          </p>
        </header>

        {/* Primary Colors */}
        <section className="space-y-4">
          <h2 className="text-h2 font-semibold text-foreground">
            Primary Colors
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <div className="h-32 rounded-lg bg-crocus-yellow p-4">
                <span className="text-sm font-medium text-black">
                  bg-crocus-yellow
                </span>
              </div>
              <code className="text-xs text-grey">oklch(86.8% 0.12 85)</code>
            </div>
            <div className="space-y-2">
              <div className="h-32 rounded-lg bg-blackberry-harvest p-4">
                <span className="text-sm font-medium text-white">
                  bg-blackberry-harvest
                </span>
              </div>
              <code className="text-xs text-grey">oklch(32.5% 0.045 310)</code>
            </div>
          </div>
        </section>

        {/* Neutral Colors */}
        <section className="space-y-4">
          <h2 className="text-h2 font-semibold text-foreground">
            Neutral Colors
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <div className="h-32 rounded-lg bg-black p-4">
                <span className="text-sm font-medium text-white">bg-black</span>
              </div>
              <code className="text-xs text-grey">oklch(15.2% 0 0)</code>
            </div>
            <div className="space-y-2">
              <div className="h-32 rounded-lg border border-grey bg-white p-4">
                <span className="text-sm font-medium text-black">bg-white</span>
              </div>
              <code className="text-xs text-grey">oklch(100% 0 0)</code>
            </div>
            <div className="space-y-2">
              <div className="h-32 rounded-lg bg-light-grey p-4">
                <span className="text-sm font-medium text-black">
                  bg-light-grey
                </span>
              </div>
              <code className="text-xs text-grey">oklch(97.5% 0.002 0)</code>
            </div>
            <div className="space-y-2">
              <div className="h-32 rounded-lg bg-grey p-4">
                <span className="text-sm font-medium text-white">bg-grey</span>
              </div>
              <code className="text-xs text-grey">oklch(42% 0 0)</code>
            </div>
            <div className="space-y-2">
              <div className="h-32 rounded-lg bg-melting-glacier p-4">
                <span className="text-sm font-medium text-black">
                  bg-melting-glacier
                </span>
              </div>
              <code className="text-xs text-grey">oklch(94.5% 0 0)</code>
            </div>
          </div>
        </section>

        {/* Secondary Colors */}
        <section className="space-y-4">
          <h2 className="text-h2 font-semibold text-foreground">
            Secondary Colors (Customization)
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <div className="h-32 rounded-lg bg-dark-grey-red p-4">
                <span className="text-sm font-medium text-white">
                  bg-dark-grey-red
                </span>
              </div>
              <code className="text-xs text-grey">oklch(40% 0.012 15)</code>
            </div>
            <div className="space-y-2">
              <div className="h-32 rounded-lg bg-dark-cyan-blue p-4">
                <span className="text-sm font-medium text-white">
                  bg-dark-cyan-blue
                </span>
              </div>
              <code className="text-xs text-grey">oklch(35% 0.02 235)</code>
            </div>
            <div className="space-y-2">
              <div className="h-32 rounded-lg bg-dark-blue p-4">
                <span className="text-sm font-medium text-white">
                  bg-dark-blue
                </span>
              </div>
              <code className="text-xs text-grey">oklch(32% 0.03 275)</code>
            </div>
            <div className="space-y-2">
              <div className="h-32 rounded-lg bg-dark-pink-red p-4">
                <span className="text-sm font-medium text-white">
                  bg-dark-pink-red
                </span>
              </div>
              <code className="text-xs text-grey">oklch(33% 0.028 15)</code>
            </div>
            <div className="space-y-2">
              <div className="h-32 rounded-lg bg-dark-orange p-4">
                <span className="text-sm font-medium text-white">
                  bg-dark-orange
                </span>
              </div>
              <code className="text-xs text-grey">oklch(37% 0.025 50)</code>
            </div>
          </div>
        </section>

        {/* Accent Colors */}
        <section className="space-y-4">
          <h2 className="text-h2 font-semibold text-foreground">
            Accent Colors (Utility)
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <div className="h-32 rounded-lg bg-maroon p-4">
                <span className="text-sm font-medium text-white">
                  bg-maroon
                </span>
              </div>
              <code className="text-xs text-grey">oklch(30% 0.12 30)</code>
            </div>
            <div className="space-y-2">
              <div className="h-32 rounded-lg bg-deep-aquamarine p-4">
                <span className="text-sm font-medium text-white">
                  bg-deep-aquamarine
                </span>
              </div>
              <code className="text-xs text-grey">oklch(52% 0.06 170)</code>
            </div>
          </div>
        </section>

        {/* Typography Test */}
        <section className="space-y-4">
          <h2 className="text-h2 font-semibold text-foreground">
            Typography System
          </h2>
          <div className="space-y-4 rounded-lg bg-light-grey p-6">
            <h1 className="text-h1 font-bold text-foreground">
              Heading 1 (text-h1) - 1.5rem
            </h1>
            <h2 className="text-h2 font-semibold text-foreground">
              Heading 2 (text-h2) - 1.25rem
            </h2>
            <h3 className="text-h3 font-semibold text-foreground">
              Heading 3 (text-h3) - 1.125rem
            </h3>
            <p className="text-body text-grey">Body text (text-body) - 1rem</p>
          </div>
        </section>

        {/* Text Color Examples */}
        <section className="space-y-4">
          <h2 className="text-h2 font-semibold text-foreground">
            Text Color Classes
          </h2>
          <div className="space-y-2 rounded-lg bg-light-grey p-6">
            <p className="text-body text-crocus-yellow">
              This text uses text-crocus-yellow
            </p>
            <p className="text-body text-blackberry-harvest">
              This text uses text-blackberry-harvest
            </p>
            <p className="text-body text-grey">This text uses text-grey</p>
            <p className="text-body text-maroon">This text uses text-maroon</p>
            <p className="text-body text-deep-aquamarine">
              This text uses text-deep-aquamarine
            </p>
          </div>
        </section>

        {/* Border Examples */}
        <section className="space-y-4">
          <h2 className="text-h2 font-semibold text-foreground">
            Border Color Classes
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border-4 border-crocus-yellow bg-white p-4">
              <span className="text-sm">border-crocus-yellow</span>
            </div>
            <div className="rounded-lg border-4 border-blackberry-harvest bg-white p-4">
              <span className="text-sm">border-blackberry-harvest</span>
            </div>
            <div className="rounded-lg border-4 border-grey bg-white p-4">
              <span className="text-sm">border-grey</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
