"use client";

import { useState } from "react";
import { useOnboardingStore } from "@/app/lib/stores/onboarding-store";
import { useOnboardingNavigation } from "@/app/lib/hooks/useOnboardingNavigation";
import { Button } from "@/app/components/ui/buttons";
import { CheckboxCircle } from "@/app/components/ui/checkbox-circle";
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
    <div className="flex w-full max-w-[260px] flex-col items-center gap-16">
      {/* Logo */}
        <Image src={LOGO_ICON} alt="LineUp logo" width={70} height={70} className="object-contain" />

      {/* Options */}
      <div className="flex w-full flex-col gap-8">
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
                  : "border-black/10"
              } ${isDisabled ? "cursor-not-allowed opacity-50" : ""}`}
            >
              <h3 className="text-center text-xl font-bold leading-[19px] tracking-[0.5px] text-text-muted">
                {type.title}
              </h3>
              <p className="text-center text-base leading-normal tracking-[0.5px] text-text-muted">
                {type.description}
              </p>
              <CheckboxCircle checked={selectedType === type.value} />
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
