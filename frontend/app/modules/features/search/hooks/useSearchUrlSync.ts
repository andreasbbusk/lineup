import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { SearchTab } from "../types";

interface UseSearchUrlSyncProps {
  query: string;
  activeTab: SearchTab;
}

/**
 * Hook for syncing search state with URL parameters
 * Debounces updates to avoid excessive history entries
 */
export const useSearchUrlSync = ({
  query,
  activeTab,
}: UseSearchUrlSyncProps) => {
  const router = useRouter();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (activeTab !== "for_you") params.set("tab", activeTab);

      const newUrl = params.toString()
        ? `/search?${params.toString()}`
        : "/search";

      router.push(newUrl, { scroll: false });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [query, activeTab, router]);
};
