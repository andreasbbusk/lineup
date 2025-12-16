import { useEffect, useState } from "react";

export function useReducedMotion() {
  // Initialize state based on media query (avoids initial flash)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() => {
    // Check if we're in the browser
    if (typeof window === "undefined") return false;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    return mediaQuery.matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Use addEventListener with the event parameter for better type safety
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []); // Empty dependency array - only run once

  return prefersReducedMotion;
}
