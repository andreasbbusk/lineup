import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: AuthLayoutProps) {
  return (
    <section className="flex min-h-screen items-center justify-center bg-white">
      {children}
    </section>
  );
}
