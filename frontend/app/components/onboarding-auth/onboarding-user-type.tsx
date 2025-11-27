"use client";

import { useState } from "react";
import { useOnboardingStore } from "@/app/lib/stores/onboarding-store";
import { useOnboardingNavigation } from "@/app/lib/hooks/useOnboardingNavigation";
import { Button } from "@/app/components/ui/buttons";
import Image from "next/image";

const LOGO_ICON = "/logos/small_logos/Frame 152.svg";

const USER_TYPES = [
  {
    value: "musician" as const,
    title: "I am a musician",
    description: "I am a musician looking for collaborations and services",
  },
  {
    value: "service_provider" as const,
    title: "Not a musician",
    description: "I want to provide services for musicians",
  },
];

export function OnboardingUserType() {
  const { data, updateData } = useOnboardingStore();
  const { nextStep } = useOnboardingNavigation();
  const [selectedType, setSelectedType] = useState<string | null>(
    data.userType || null
  );

  const handleSelect = (value: "musician" | "service_provider") => {
    setSelectedType(value);
    updateData({ userType: value });
  };

  return (
    <div className="flex w-full max-w-[260px] flex-col items-center gap-[60px]">
      {/* Logo */}
        <Image src={LOGO_ICON} alt="LineUp logo" width={70} height={70} className="object-contain" />

      {/* Options */}
      <div className="flex w-full flex-col gap-[30px]">
        {USER_TYPES.map((type) => {
          const isDisabled = type.value === "service_provider";
          return (
            <button
              key={type.value}
              onClick={() => !isDisabled && handleSelect(type.value)}
              disabled={isDisabled}
              className={`flex w-full flex-col items-center gap-5 rounded-[25px] border p-5 transition ${
                selectedType === type.value
                  ? "border-grey"
                  : "border-[rgba(0,0,0,0.1)]"
              } ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
            >
              <h3 className="text-center text-xl font-bold leading-[19px] tracking-[0.5px] text-[#404040]">
                {type.title}
              </h3>
              <p className="text-center text-base leading-normal tracking-[0.5px] text-[#404040]">
                {type.description}
              </p>
              <div className="relative h-6 w-6">
                {selectedType === type.value ? (
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="12" cy="12" r="12" fill="#FFCF70" />
                    <path
                      d="M7 12L10.5 15.5L17 9"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-[rgba(0,0,0,0.1)]" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Continue Button */}
      <Button type="button" variant="primary" onClick={nextStep}>
        Continue
      </Button>
    </div>
  );
}
