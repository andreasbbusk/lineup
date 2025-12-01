"use client";

import { useEffect, useState } from "react";
import { useOnboardingNavigation } from "../../hooks/useOnboardingNavigation";
import Image from "next/image";

const LOGO_URL = "/logos/big_logos/no-bg.svg";
const DISPLAY_DURATION = 2000; // How long to show splash
const EXIT_ANIMATION_DURATION = 500; // Fade out duration

export function OnboardingSplash() {
  const { nextStep } = useOnboardingNavigation();
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Start exit animation after display duration
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, DISPLAY_DURATION);

    // Navigate after exit animation completes
    const navigationTimer = setTimeout(() => {
      nextStep();
    }, DISPLAY_DURATION + EXIT_ANIMATION_DURATION);

    // Cleanup both timers if component unmounts
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(navigationTimer);
    };
  }, [nextStep]);

  return (
    <div className="fixed inset-0 flex h-full w-full items-center justify-center bg-crocus-yellow">
      <div
        className={`transition-all duration-500 ease-in-out motion-reduce:transition-none ${
          isExiting
            ? "scale-110 opacity-0"
            : "scale-100 opacity-100"
        }`}
      >
        <Image
          src={LOGO_URL}
          width={250}
          height={80}
          alt="LineUp Logo"
          priority // Load immediately (above the fold)
        />
      </div>
    </div>
  );
}
