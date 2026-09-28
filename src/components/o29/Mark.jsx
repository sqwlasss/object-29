import { cn } from "@/lib/utils";

/**
 * The Ø29 mark.
 *
 * `signature` (the default) is the REQUIRED one: small, uncropped, bottom-right
 * of every footer field — exactly where it sits in the reference artworks.
 * This, not the oversized crop, is the brand's actual signature.
 *
 * `cropped` is a ONE-INSTANCE-PER-SITE object: Home's final bone room, before
 * the footer, and nowhere else. It is deliberately demoted — all four
 * reference artworks agree the real mark is small and uncropped, and the
 * oversized crop is the most template-worn device in this genre. Forbidden on
 * Shop, Product, cart, account, forms, and every error or empty state.
 *
 * Always decorative: aria-hidden, unselectable, never a loading state, never
 * animated, never centred.
 */
export default function Mark({ variant = "signature", className = "", ...rest }) {
  const cropped = variant === "cropped";

  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none select-none font-display font-medium leading-none",
        cropped ? "text-mega text-mark" : "text-h1 text-field-fg",
        className
      )}
      {...rest}
    >
      Ø29
    </span>
  );
}
