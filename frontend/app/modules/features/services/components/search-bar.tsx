"use client";

import { memo } from "react";
import Image from "next/image";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function SearchBarComponent({
  value,
  onChange,
  placeholder = "Search",
}: SearchBarProps) {
  return (
    <div className="flex items-center gap-3 flex-1 rounded-lg bg-[#E7E7E7] px-2 py-1">
      <Image
        src="/icons/search.svg"
        alt="Search"
        width={20}
        height={20}
        className="opacity-60 shrink-0"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 text-base text-black placeholder:text-black/60 bg-transparent focus:outline-none"
        aria-label="Search services and collaboration requests"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
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
  );
}

export const SearchBar = memo(SearchBarComponent);
