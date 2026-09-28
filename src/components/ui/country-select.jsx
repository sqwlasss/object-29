import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import COUNTRIES, { getCountryByCode, storeCountry, getStoredCountry } from "@/lib/countries";

export default function CountrySelect({ value, onChange, id, required, className = "", placeholder = "Select a country" }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const listRef = useRef(null);
  const searchInputRef = useRef(null);
  const triggerRef = useRef(null);

  const selected = getCountryByCode(value);

  useEffect(() => {
    if (!value) {
      const stored = getStoredCountry();
      if (stored) {
        onChange(stored);
      }
    }
  }, []);

  const filtered = search
    ? COUNTRIES.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.code.toLowerCase().includes(search.toLowerCase())
      )
    : COUNTRIES;

  const handleSelect = useCallback(
    (code) => {
      onChange(code);
      storeCountry(code);
      setOpen(false);
      setSearch("");
      triggerRef.current?.focus();
    },
    [onChange]
  );

  useEffect(() => {
    if (open) {
      setSearch("");
      setHighlightedIndex(-1);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (open && selected && listRef.current) {
      const idx = filtered.findIndex((c) => c.code === value);
      if (idx >= 0) {
        setHighlightedIndex(idx);
        const item = listRef.current.children[idx];
        if (item) item.scrollIntoView({ block: "nearest" });
      }
    }
  }, [open, value, filtered]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filtered.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filtered[highlightedIndex]) {
          handleSelect(filtered[highlightedIndex].code);
        }
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
        break;
    }
  };

  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex];
      if (item) item.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
          aria-required={required}
          aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex min-h-hit w-full items-center justify-between rounded-none border border-o29-edge bg-transparent px-3 py-2 text-base transition-colors duration-instant hover:bg-o29-bone-2 disabled:cursor-not-allowed disabled:border-o29-rule disabled:bg-o29-bone-2 disabled:text-o29-slate md:text-sm",
          !selected && "text-o29-slate",
          className
        )}
      >
        {selected ? (
          <span className="flex items-center gap-2">
            <span className="text-base leading-none">{selected.flag}</span>
            <span className="truncate">{selected.name}</span>
          </span>
        ) : (
          <span className="text-o29-slate">{placeholder}</span>
        )}
        <ChevronDown
          size={14}
          className={cn(
            "shrink-0 text-o29-slate transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="o29-field o29-field--bone absolute z-50 mt-1 flex max-h-72 w-full flex-col rounded-none border border-hairline">
          <div className="flex items-center gap-2 border-b border-hairline px-3 py-2">
            <Search size={14} className="shrink-0 text-o29-slate" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setHighlightedIndex(-1);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search countries..."
              className="flex-1 bg-transparent text-sm placeholder:text-o29-slate"
            />
          </div>
          <ul
            ref={listRef}
            role="listbox"
            className="flex-1 overflow-y-auto py-1"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-o29-slate">No countries found</li>
            ) : (
              filtered.map((country, idx) => (
                <li
                  key={country.code}
                  role="option"
                  aria-selected={value === country.code}
                  onClick={() => handleSelect(country.code)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 text-sm cursor-pointer transition-colors",
                    highlightedIndex === idx
                      ? "bg-o29-bone-2"
                      : "hover:bg-o29-bone-2",
                    value === country.code && "font-medium"
                  )}
                >
                  <span className="text-base leading-none">{country.flag}</span>
                  <span className="flex-1 truncate">{country.name}</span>
                  {value === country.code && (
                    <Check size={14} className="shrink-0 text-o29-ink" />
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
