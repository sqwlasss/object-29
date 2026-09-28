import Reveal from "@/components/motion/Reveal";

/**
 * Deprecated alias for <Reveal>, kept so the ~140 existing call sites keep
 * compiling unchanged while the rebrand is in progress. The props are
 * identical ({ children, className, delay } — delay in seconds).
 *
 * Reveal fixes the defect this component used to carry: an inline
 * `opacity: 0` with no reduced-motion branch and no IntersectionObserver
 * fallback, which could leave content permanently invisible.
 *
 * Call sites migrate to Reveal as each page is restyled; this file is deleted
 * in stage 8.
 */
export default function FadeIn(props) {
  return <Reveal {...props} />;
}
