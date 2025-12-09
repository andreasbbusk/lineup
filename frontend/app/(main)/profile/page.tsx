"use client";

import { useAppStore } from "@/app/modules/stores/app-store";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/app/modules/components/loading-spinner";
import { useEffect } from "react";

export default function Page() {
  const router = useRouter();
  const { user, isInitialized } = useAppStore();

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (!user) {
      router.push("/login");
      return;
    }

    if (!user.username) {
      router.push("/onboarding");
      return;
    }

    router.push(`/profile/${user.username}`);
  }, [user, isInitialized, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size={40} />
    </div>
  );
}
