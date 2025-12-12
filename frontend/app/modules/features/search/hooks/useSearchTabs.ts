import { useState, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { searchApi } from "@/app/modules/api/searchApi";
import type { SearchTab } from "../types";
import { TAB_ORDER } from "../constants";

interface UseSearchTabsProps {
  initialTab?: SearchTab;
  query: string;
}

/**
 * Hook for managing search tabs with prefetching
 * Automatically prefetches adjacent tabs for smoother navigation
 */
export const useSearchTabs = ({
  initialTab = "for_you",
  query,
}: UseSearchTabsProps) => {
  const [activeTab, setActiveTab] = useState<SearchTab>(initialTab);
  const queryClient = useQueryClient();

  const activeTabIndex = TAB_ORDER.indexOf(activeTab);

  // Prefetch adjacent tabs for smooth transitions
  useEffect(() => {
    if (!query.trim()) return;

    const prefetchAdjacentTabs = async () => {
      const currentIndex = activeTabIndex;

      // Prefetch next tab
      if (currentIndex < TAB_ORDER.length - 1) {
        const nextTab = TAB_ORDER[currentIndex + 1];
        await queryClient.prefetchQuery({
          queryKey: ["search", nextTab, query],
          queryFn: () => searchApi.search(query, nextTab),
          staleTime: 1000 * 60 * 5,
        });
      }

      // Prefetch previous tab
      if (currentIndex > 0) {
        const prevTab = TAB_ORDER[currentIndex - 1];
        await queryClient.prefetchQuery({
          queryKey: ["search", prevTab, query],
          queryFn: () => searchApi.search(query, prevTab),
          staleTime: 1000 * 60 * 5,
        });
      }
    };

    prefetchAdjacentTabs();
  }, [activeTab, query, activeTabIndex, queryClient]);

  const handleTabChange = useCallback((tab: SearchTab) => {
    setActiveTab(tab);
  }, []);

  return {
    activeTab,
    activeTabIndex,
    setActiveTab,
    handleTabChange,
  };
};
