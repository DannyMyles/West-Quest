"use client";

import { Search, X } from "lucide-react";

export function SearchBar({
  value,
  onChange,
  placeholder = "Search phones, tablets, brands…",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search devices"
        className="field py-3 pl-11 pr-10"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
