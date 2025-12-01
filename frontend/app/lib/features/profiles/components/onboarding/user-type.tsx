"use client";

import { useAppStore } from "@/app/lib/stores/app-store";
import { useOnboardingNavigation } from "../../hooks/useOnboardingNavigation";
import { Button } from "@/app/components/ui/buttons";
import { CheckboxCircle } from "@/app/components/ui/checkbox-circle";
import Image from "next/image";

const LOGO_ICON = "/logos/small_logos/white-and-yellow.svg";

const USER_TYPES = [
  {
    value: "musician" as const,
    title: "I am a musician",
    description: "I am a musician looking for collaborations and services",
    disabled: false,
  },
  {
    value: "service_provider" as const,
    title: "Not a musician",
    description: "I want to provide services for musicians",
    disabled: true, // Coming soon
  },
];

export function OnboardingUserTypeStep() {
  const { onboarding, update_onboarding_data } = useAppStore();
  const { nextStep } = useOnboardingNavigation();

  const selectedType = onboarding.data.user_type;

  const handleSelect = (value: "musician" | "service_provider") => {
    update_onboarding_data({ user_type: value });
  };

  const canContinue = !!selectedType;

  return (
    <div className="flex w-full max-w-[260px] flex-col items-center gap-16">
      {/* Logo */}
      <Image
        src={LOGO_ICON}
        alt="LineUp logo"
        width={70}
        height={70}
        className="object-contain"
      />

      {/* Options */}
      <div className="flex w-full flex-col gap-8">
        {USER_TYPES.map((type) => {
          const isSelected = selectedType === type.value;
          return (
            <button
              key={type.value}
              onClick={() => !type.disabled && handleSelect(type.value)}
              disabled={type.disabled}
              className={`flex w-full flex-col items-center gap-5 rounded-3xl border p-5 transition-colors ${
                isSelected ? "border-grey" : "border-black/10"
              } ${
                type.disabled
                  ? "cursor-not-allowed opacity-50"
                  : "hover:border-grey/50"
              }`}
              aria-label={type.title}
              aria-pressed={isSelected}
            >
              <h3 className="text-center text-xl font-bold leading-[19px] tracking-[0.5px] text-text-muted">
                {type.title}
              </h3>
              <p className="text-center text-base leading-normal tracking-[0.5px] text-text-muted">
                {type.description}
              </p>
              <CheckboxCircle checked={isSelected} />
            </button>
          );
        })}
      </div>

      {/* Continue Button */}
      <Button
        type="button"
        variant="primary"
        onClick={nextStep}
        disabled={!canContinue}
      >
        Continue
      </Button>
    </div>
  );
}
