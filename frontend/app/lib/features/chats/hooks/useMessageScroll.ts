/**
 * Chat scroll management hook.
 * Handles auto-scroll to bottom on load and new messages, infinite scroll
 * pagination when scrolling to top, and scroll position preservation.
 */

import { useEffect, useRef } from "react";

type ScrollConfig = {
  autoScrollThreshold?: number;
  loadMoreThreshold?: number;
};

type UseMessageScrollReturn = {
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  messagesContainerRef: React.RefObject<HTMLDivElement | null>;
  handleScroll: () => void;
};

export function useMessageScroll(
  messageCount: number,
  hasNextPage: boolean,
  isFetchingNextPage: boolean,
  fetchNextPage: () => Promise<unknown>,
  config: ScrollConfig = {}
): UseMessageScrollReturn {
  const {
    autoScrollThreshold = 150,
    loadMoreThreshold = 100,
  } = config;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const hasInitiallyScrolled = useRef(false);
  const previousMessageCount = useRef(0);

  // Initial scroll to bottom on first load
  useEffect(() => {
    if (
      messageCount > 0 &&
      messagesEndRef.current &&
      !hasInitiallyScrolled.current
    ) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
      hasInitiallyScrolled.current = true;
    }
  }, [messageCount]);

  // Auto-scroll on new messages only if user is near bottom
  useEffect(() => {
    const hasNewMessages = messageCount > previousMessageCount.current;
    const shouldAutoScroll =
      hasInitiallyScrolled.current && messagesEndRef.current;

    if (hasNewMessages && shouldAutoScroll) {
      const container = messagesContainerRef.current;
      if (container) {
        const distanceFromBottom =
          container.scrollHeight - container.scrollTop - container.clientHeight;

        const isNearBottom = distanceFromBottom < autoScrollThreshold;
        if (isNearBottom) {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      }
    }

    previousMessageCount.current = messageCount;
  }, [messageCount, autoScrollThreshold]);

  // Load older messages when scrolling near top
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const isNearTop = container.scrollTop < loadMoreThreshold;
    const canLoadMore = hasNextPage && !isFetchingNextPage;

    if (isNearTop && canLoadMore) {
      const previousScrollHeight = container.scrollHeight;

      fetchNextPage().then(() => {
        requestAnimationFrame(() => {
          if (container) {
            const newScrollHeight = container.scrollHeight;
            const scrollDifference = newScrollHeight - previousScrollHeight;
            container.scrollTop = scrollDifference;
          }
        });
      });
    }
  };

  return {
    messagesEndRef,
    messagesContainerRef,
    handleScroll,
  };
}
