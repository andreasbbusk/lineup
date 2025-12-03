"use client";

import { Suspense } from "react";
import { QueryProvider } from "./lib/query/provider";
import { LoadingSpinner } from "./components/loading-spinner";
import AuthGuard from "./lib/features/auth/components/auth-guard";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <Suspense fallback={<LoadingSpinner variant="rays" />}>
        <AuthGuard>{children}</AuthGuard>
      </Suspense>
    </QueryProvider>
  );
}
