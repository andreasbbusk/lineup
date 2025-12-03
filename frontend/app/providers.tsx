"use client";

import { Suspense } from "react";
import { QueryProvider } from "./lib/query/provider";
import { LoadingSpinner } from "./components/loading-spinner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>
    </QueryProvider>
  );
}
