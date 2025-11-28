"use client";

import { Check } from "lucide-react";

interface CheckboxCircleProps {
  checked: boolean;
  className?: string;
}

export function CheckboxCircle({ checked, className = "" }: CheckboxCircleProps) {
  return (
    <div
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors ${
        checked ? "bg-crocus-yellow" : "border border-black/10 bg-white"
      } ${className}`}
    >
      {checked && <Check className="h-4 w-4 text-black" strokeWidth={3} />}
    </div>
  );
}
