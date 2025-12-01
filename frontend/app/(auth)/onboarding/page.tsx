import { Suspense } from "react";
import { OnboardingWrapper } from "@/app/lib/features/profiles";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OnboardingWrapper />
    </Suspense>
  );
}
