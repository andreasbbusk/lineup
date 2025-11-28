import { Suspense } from "react";
import { OnboardingWrapper } from "@/app/components/onboarding-auth";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OnboardingWrapper />
    </Suspense>
  );
}
