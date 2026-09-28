// Single source of truth for the cookie-consent storage key.
//
// This value is INTENTIONALLY still "ddouble_consent" after the ØBJECT 29
// rebrand. Renaming it would make every returning visitor's stored consent
// unreadable, re-prompting them and leaving GA4 dark until they accept again.
// The visible brand name has no dependency on this string.
//
// It previously existed as two hand-copied literals — one in
// CookieConsent.jsx and one in analytics.js — which could silently diverge.
// Both now import it from here.
export const CONSENT_KEY = "ddouble_consent";

export function consentGranted() {
  try {
    return localStorage.getItem(CONSENT_KEY) === "accepted";
  } catch {
    // Private mode, blocked storage: treat as no consent rather than throwing.
    return false;
  }
}
