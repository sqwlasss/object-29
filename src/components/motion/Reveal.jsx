import { useState, useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Scroll entrance. The ONLY scroll-triggered motion in the system.
 *
 * ── Why this is written defensively ──────────────────────────────────────
 * The component this replaces set `opacity: 0` inline as its initial state and
 * relied entirely on an IntersectionObserver callback to raise it back to 1.
 * Every failure path in that design hides content permanently: a missed
 * reduced-motion branch, an observer that never fires, an unavailable
 * IntersectionObserver, or a global `prefers-reduced-motion` rule that zeroes
 * transition durations without ever touching the inline `opacity: 0`.
 *
 * That is not hypothetical here — on the previous build, turning Windows
 * animations off made page content fail to display, and the response was to
 * remove reduced-motion support entirely (commit 0c817d7) rather than fix the
 * cause. This component restores the setting AND removes the trap.
 *
 * The rule: hidden is OPT-IN. We only ever hide content after synchronously
 * confirming, on the very first render, that motion is allowed and that an
 * IntersectionObserver exists to bring it back. Anything else — including
 * anything we cannot determine — renders plain and fully visible.
 *
 * Three independent guards, any one of which yields visible content:
 *   1. prefers-reduced-motion: reduce  → never hidden, no wrapper styles
 *   2. no IntersectionObserver         → never hidden, no wrapper styles
 *   3. observer armed but never fires  → SAFETY_MS timeout forces visible
 */

// If the observer has not fired by now, something is wrong with it, not with
// the page. Reveal the content and stop waiting. Comfortably longer than any
// real scroll-into-view, short enough that a reader never sees a gap.
const SAFETY_MS = 1500;

// Motion must never delay a shopper reaching a product. Shop.jsx previously
// computed `delay={i * 0.04}` over its ACCUMULATED list, so after one "load
// more" the last cards waited ~4s before appearing. The cap lives here rather
// than at the call site so no caller can reintroduce an uncapped index.
const MAX_STAGGER_STEPS = 5;
const STAGGER_STEP = 0.07;

function canAnimate() {
  if (typeof window === "undefined") return false;
  if (prefersReducedMotion()) return false;
  return typeof window.IntersectionObserver === "function";
}

export default function Reveal({ children, className = "", delay = 0, as: Tag = "div" }) {
  const ref = useRef(null);

  // Decided ONCE, synchronously, before the first paint. `false` here means
  // this component renders as a plain element for its whole life.
  const [animating] = useState(canAnimate);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (!animating) return undefined;
    const el = ref.current;
    if (!el) {
      // No node to observe — do not leave the content hidden.
      setShown(true);
      return undefined;
    }

    let observer;
    const reveal = () => setShown(true);

    // Guard 3: the observer exists but never delivers (blocked, detached,
    // zero-size ancestor, an extension interfering). Reveal anyway.
    const safety = window.setTimeout(reveal, SAFETY_MS);

    try {
      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            reveal();
            observer.disconnect();
          }
        },
        { rootMargin: "-50px", threshold: 0 }
      );
      observer.observe(el);
    } catch {
      reveal();
    }

    return () => {
      window.clearTimeout(safety);
      if (observer) observer.disconnect();
    };
  }, [animating]);

  // The static path: no opacity, no transform, no transition, nothing that
  // could strand the content. This is what reduced-motion visitors get, and
  // it is what anything unexpected falls back to.
  if (!animating) {
    return (
      <Tag ref={ref} className={className}>
        {children}
      </Tag>
    );
  }

  const steps = Math.min(Math.max(Math.round(delay / STAGGER_STEP), 0), MAX_STAGGER_STEPS);
  const seconds = steps * STAGGER_STEP;

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(12px)",
        transition: `opacity var(--dur-reveal) var(--ease-room) ${seconds}s, transform var(--dur-reveal) var(--ease-room) ${seconds}s`,
        willChange: shown ? "auto" : "opacity, transform",
      }}
    >
      {children}
    </Tag>
  );
}
