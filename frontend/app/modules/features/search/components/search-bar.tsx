"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onCancel?: () => void;
  placeholder?: string;
  debounceMs?: number;
}

export function SearchBar({
  value,
  onChange,
  onCancel,
  placeholder = "Search",
  debounceMs = 300,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  // Sync local value with prop value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce the onChange callback
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [localValue, onChange, debounceMs, value]);

  const handleCancel = () => {
    setLocalValue("");
    onChange("");
    onCancel?.();
  };

  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex items-center gap-3 flex-1 rounded-xl bg-white/20 px-4 py-2.5">
        <Image
          src="/icons/search.svg"
          alt="Search"
          width={18}
          height={18}
          className="opacity-60"
        />
        <input
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 text-base text-white placeholder:text-white/60 bg-transparent focus:outline-none"
          autoFocus
        />
      </div>
      <button
        onClick={handleCancel}
        className="text-base font-medium text-white hover:opacity-80 transition-opacity"
      >
        Cancel
      </button>
    </div>
  );
}
