"use client";

import { useAppStore } from "@/app/modules/stores/Store";
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

    router.push(`/profile/${user?.username}`);
  }, [user, isInitialized, router]);

  return <LoadingSpinner />;
}
