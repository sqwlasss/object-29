import { useEffect, useState } from "react";
import { CONSENT_KEY } from "@/lib/consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) setVisible(true);
  }, []);

  const decide = (value) => {
    localStorage.setItem(CONSENT_KEY, value);
    setVisible(false);
    window.dispatchEvent(new CustomEvent("consent-change", { detail: value === "accepted" }));
  };

  if (!visible) return null;

  return (
    <div
      className="o29-field o29-field--ink fixed inset-x-0 bottom-0 z-[70] px-gutter py-4"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      role="region"
      aria-label="Cookie consent"
    >
      <div className="mx-auto flex max-w-page flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <p className="max-w-reading text-sm text-field-fg">
          We use cookies to measure site usage. See our{" "}
          <a href="/privacy" className="underline underline-offset-2">Privacy Policy</a>.
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            onClick={() => decide("rejected")}
            className="o29-meta o29-hit border border-control px-5 text-field-fg transition-colors duration-instant hover:bg-field-fg hover:text-field"
          >
            Reject
          </button>
          <button
            onClick={() => decide("accepted")}
            className="o29-meta o29-hit bg-field-fg px-5 text-field transition-opacity duration-instant hover:opacity-80"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
