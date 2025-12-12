"use client";

import { memo, useState, useEffect, useCallback } from "react";
import Image from "next/image";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onCancel?: () => void;
  onSubmit?: () => void;
  placeholder?: string;
  debounceMs?: number;
}

function SearchBarComponent({
  value,
  onChange,
  onCancel,
  onSubmit,
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

  const handleClear = useCallback(() => {
    setLocalValue("");
    onChange("");
  }, [onChange]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalValue(e.target.value);
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && localValue.trim() && onSubmit) {
        e.preventDefault();
        onSubmit();
      }
    },
    [localValue, onSubmit]
  );

  return (
    <div className="flex items-center gap-3 w-full bg-white">
      <div className="flex items-center gap-3 flex-1 rounded-lg bg-[#f1f1f1] px-2 py-1">
        <Image
          src="/icons/search.svg"
          alt="Search"
          width={20}
          height={20}
          className="opacity-60 shrink-0"
        />
        <input
          type="text"
          value={localValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 text-base text-black placeholder:text-black/60 bg-transparent focus:outline-none"
          autoFocus
        />
        {localValue && (
          <button
            onClick={handleClear}
            className="flex items-center justify-center shrink-0 hover:opacity-70 transition-opacity"
            aria-label="Clear search"
          >
            <Image
              src="/icons/close.svg"
              alt="Clear"
              width={20}
              height={20}
              className="opacity-60"
            />
          </button>
        )}
      </div>
      <button
        onClick={onCancel}
        className="text-base font-medium text-black hover:opacity-70 transition-opacity shrink-0"
      >
        Cancel
      </button>
    </div>
  );
}

export const SearchBar = memo(SearchBarComponent);
