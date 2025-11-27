"use client";

import { useState } from "react";
import Link from "next/link";
import { useLoginMutation } from "@/app/lib/query/mutations/auth.mutations";
import { ErrorMessage } from "@/app/components/ui/error-message";

export function LoginWrapper() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { mutate: login, isPending, error } = useLoginMutation();

  const emailIsValid = /\S+@\S+\.\S+/.test(email);
  const canSubmit = emailIsValid && password.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit) {
      login({ email, password });
    }
  };

  return (
    <main className="space-y-10">
      <section className="space-y-6">
        <header className="space-y-2 text-center">
          <p className="text-sm uppercase tracking-widest text-grey">
            Welcome back
          </p>
          <h1 className="text-h1 font-semibold text-foreground">Sign in</h1>
          <p className="text-body text-grey">
            Access your messages, posts and collaborations.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <ErrorMessage message={error.message} />}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-light-grey bg-light-grey/50 px-4 py-3 text-sm outline-none focus:border-blackberry-harvest"
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-light-grey bg-light-grey/50 px-4 py-3 text-sm outline-none focus:border-blackberry-harvest"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit || isPending}
            className="w-full rounded-2xl bg-blackberry-harvest py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? "Signing in..." : "Sign in"}
          </button>

          <Link
            href="#"
            className="block text-center text-sm font-medium text-grey transition hover:text-foreground"
          >
            Forgot password?
          </Link>
        </form>

        <div className="text-center text-sm text-grey">
          Don&apos;t have an account?{" "}
          <Link
            href="/onboarding"
            className="font-semibold text-blackberry-harvest transition hover:opacity-80"
          >
            Create profile
          </Link>
        </div>
      </section>
    </main>
  );
}
