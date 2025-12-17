"use client";

import { LoginForm } from "@/app/modules/features/auth";
import { PageTransition } from "@/app/modules/components/page-transition";

export default function Page() {
  return (
    <PageTransition>
      <div className="flex min-h-screen items-center justify-center">
        <LoginForm />
      </div>
    </PageTransition>
  );
}
