import { useState, useEffect } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * True when the visitor has asked their OS to reduce motion.
 *
 * Reads synchronously on first render so a motion-sensitive component never
 * paints an animated frame before finding out, and subscribes to `change` so
 * toggling the OS setting takes effect without a reload.
 *
 * Fails SAFE: if `matchMedia` is unavailable or throws, this returns `true`
 * (assume reduced). Every caller treats `true` as "render the plain, fully
 * visible thing", so an environment we cannot interrogate gets the static
 * version rather than a half-initialised animation.
 */
export function prefersReducedMotion() {
  try {
    return window.matchMedia(QUERY).matches;
  } catch {
    return true;
  }
}

export default function useReducedMotion() {
  const [reduced, setReduced] = useState(prefersReducedMotion);

  useEffect(() => {
    let mql;
    try {
      mql = window.matchMedia(QUERY);
    } catch {
      return undefined;
    }
    const onChange = (e) => setReduced(e.matches);
    // Safari < 14 only has the deprecated addListener.
    if (mql.addEventListener) mql.addEventListener("change", onChange);
    else if (mql.addListener) mql.addListener(onChange);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", onChange);
      else if (mql.removeListener) mql.removeListener(onChange);
    };
  }, []);

  return reduced;
}
