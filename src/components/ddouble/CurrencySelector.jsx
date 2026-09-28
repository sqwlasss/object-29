import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useCurrency } from "@/lib/CurrencyContext";
import useEscapeClose from "@/hooks/useEscapeClose";
import usePanelFocus from "@/hooks/usePanelFocus";

/**
 * Display currency only. This formats the number with Intl; it does NOT
 * convert it — the catalogue is pinned to the store country so Shopify never
 * reprices. Do not present this as a conversion.
 */
export default function CurrencySelector() {
  const { currencyCode, setCurrency, supportedCurrencies, currencyInfo } = useCurrency();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const menuRef = useRef(null);

  // Escape closes the menu; focus moves into it on open and back to the
  // trigger on close.
  const saveCurrencyFocus = usePanelFocus(open, menuRef);
  const toggle = () => {
    saveCurrencyFocus();
    setOpen((prev) => !prev);
  };
  useEscapeClose(open, () => setOpen(false));

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={toggle}
        className="o29-meta o29-hit flex items-center gap-1 text-field-fg transition-opacity duration-instant hover:opacity-60"
        aria-label="Select display currency"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span>{currencyCode}</span>
        <ChevronDown size={12} aria-hidden="true" />
      </button>
      {open && (
        <div
          ref={menuRef}
          tabIndex={-1}
          className="o29-field o29-field--bone absolute right-0 top-full z-10 mt-2 min-w-[150px] border border-hairline py-2"
        >
          {supportedCurrencies.map((c) => (
            <button
              key={c.code}
              onClick={() => { setCurrency(c.code); setOpen(false); }}
              aria-current={currencyCode === c.code ? "true" : undefined}
              className={`flex min-h-hit w-full items-center gap-2 px-4 text-xs transition-colors duration-instant hover:bg-o29-bone-2 ${
                currencyCode === c.code ? "font-medium text-o29-ink" : "text-o29-slate"
              }`}
            >
              <span className="w-6 tabular-nums">{c.symbol}</span>
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function MobileCurrencySelector() {
  const { currencyCode, setCurrency, supportedCurrencies } = useCurrency();

  return (
    <div>
      <span className="o29-meta mb-3 block text-field-muted">Currency</span>
      <div className="flex flex-wrap gap-2">
        {supportedCurrencies.map((c) => (
          <button
            key={c.code}
            onClick={() => setCurrency(c.code)}
            aria-pressed={currencyCode === c.code}
            className={`o29-hit flex items-center justify-center border px-4 text-xs transition-colors duration-instant ${
              currencyCode === c.code
                ? "border-control bg-field-fg text-field"
                : "border-control text-field-fg"
            }`}
          >
            {c.symbol} {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}
