"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
  display?: React.ReactNode;
}

interface CustomSelectProps {
  value: string;
  onAction: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  error?: boolean;
  triggerWidth?: string;
}

export function CustomSelect({
  value,
  onAction,
  options,
  placeholder = "Select...",
  className = "",
  error = false,
  triggerWidth = "w-full",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Scroll selected item into view when dropdown opens
  useEffect(() => {
    if (isOpen && dropdownRef.current && value) {
      const selectedElement = dropdownRef.current.querySelector(
        `[data-value="${value}"]`
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [isOpen, value]);

  const handleSelect = (optionValue: string) => {
    onAction(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative shrink-0 ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex ${triggerWidth} h-[44px] items-center justify-between rounded-lg border bg-white px-2.5 py-2 text-[16px] leading-normal tracking-[0.5px] transition-colors ${
          error
            ? "border-maroon bg-maroon/5"
            : "border-black/10 hover:border-black/20"
        } ${isOpen ? "ring-2 ring-black/20" : ""}`}
      >
        <span className={`whitespace-nowrap ${selectedOption ? "text-black" : "text-input-placeholder"}`}>
          {selectedOption?.display || selectedOption?.label || placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute no-scrollbar z-50 mt-1 max-h-60 min-w-full overflow-y-auto rounded-lg border border-black/10 bg-white shadow-lg"
        >
          <div className="p-1">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                data-value={option.value}
                onClick={() => handleSelect(option.value)}
                className={`flex w-full items-center whitespace-nowrap rounded-sm px-2 py-2 text-left text-[16px] transition-colors ${
                  option.value === value
                    ? "bg-black/10 font-medium"
                    : "hover:bg-black/5"
                }`}
              >
                {option.display || option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
