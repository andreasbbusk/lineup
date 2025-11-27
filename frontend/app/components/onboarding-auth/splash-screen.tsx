"use client";

import { useEffect, useState } from "react";
import { useOnboardingNavigation } from "@/app/lib/hooks/useOnboardingNavigation";
import Image from "next/image";

const LOGO_URL = "/logos/big_logos/Frame 155.svg";

export function OnboardingSplash() {
  const { nextStep } = useOnboardingNavigation();
  const [isExiting, setIsExiting] = useState(false);

  const handleExit = () => {
    setIsExiting(true);
    setTimeout(() => {
      nextStep();
    }, 500); // Match animation duration
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleExit();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed w-full h-full bg-crocus-yellow inset-0 flex items-center justify-center">
      <div
        className={`transition-all duration-500 ease-in-out ${
          isExiting ? "opacity-0 scale-120" : "opacity-100 scale-100"
        }`}
      >
        <Image src={LOGO_URL} width={250} height={80} alt="LineUp Logo" />
      </div>
    </div>
  );
}
