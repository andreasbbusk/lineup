import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: AuthLayoutProps) {
  return (
    <section className="flex min-h-screen items-center justify-center bg-light-grey px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-sm">
        {children}
      </div>
    </section>
  );
}
