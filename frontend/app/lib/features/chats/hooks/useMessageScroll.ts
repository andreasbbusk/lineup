import { useEffect, useRef } from "react";
import { SCROLL_CONFIG } from "../constants";

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
    autoScrollThreshold = SCROLL_CONFIG.AUTO_SCROLL_THRESHOLD,
    loadMoreThreshold = SCROLL_CONFIG.LOAD_MORE_THRESHOLD,
  } = config;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const hasInitiallyScrolled = useRef(false);
  const previousMessageCount = useRef(0);

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

  useEffect(() => {
    const hasNewMessages = messageCount > previousMessageCount.current;
    if (hasNewMessages && hasInitiallyScrolled.current) {
      const container = messagesContainerRef.current;
      if (container) {
        const distanceFromBottom =
          container.scrollHeight - container.scrollTop - container.clientHeight;

        if (distanceFromBottom < autoScrollThreshold) {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      }
    }
    previousMessageCount.current = messageCount;
  }, [messageCount, autoScrollThreshold]);

  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    if (
      container.scrollTop < loadMoreThreshold &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      const previousScrollHeight = container.scrollHeight;

      fetchNextPage().then(() => {
        requestAnimationFrame(() => {
          if (container) {
            container.scrollTop = container.scrollHeight - previousScrollHeight;
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
