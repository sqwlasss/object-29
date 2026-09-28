import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

/**
 * Variant NAMES are unchanged so every existing call site keeps working; only
 * what they resolve to has changed.
 *
 * Two system rules are encoded here rather than patched per page:
 *
 *  1. THE 44px FLOOR. Every size carries `min-h-hit`. The old h-8/h-9 sizes
 *     were below the tap-target minimum, which is why 33 `min-h-11` overrides
 *     are scattered across 8 files. Pad to reach the floor, never shrink.
 *
 *  2. DISABLED IS NOT TRANSPARENCY. `disabled:opacity-50` fades the label
 *     along with the fill and routinely lands under 4.5:1. Disabled state is
 *     drawn instead: a bone-2 ground with slate text (5.04:1) and an edge
 *     border (3.29:1), all of which stay legible.
 *
 * Buttons never move. The hover is a colour change at --dur-instant with no
 * transform — nothing between "I want this" and "I paid" animates.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-xs font-medium uppercase tracking-[0.12em] min-h-hit transition-colors duration-instant disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-o29-ink text-o29-bone hover:bg-o29-cobalt disabled:bg-o29-bone-2 disabled:text-o29-slate",
        destructive:
          "bg-o29-vermilion text-o29-bone hover:bg-o29-ink disabled:bg-o29-bone-2 disabled:text-o29-slate",
        outline:
          "border border-o29-edge bg-transparent text-o29-ink hover:bg-o29-bone-2 disabled:border-o29-rule disabled:text-o29-slate",
        secondary:
          "bg-o29-bone-2 text-o29-ink hover:bg-o29-rule disabled:text-o29-slate",
        ghost:
          "text-o29-ink hover:bg-o29-bone-2 disabled:text-o29-slate",
        link:
          "text-o29-ink underline underline-offset-4 decoration-o29-edge hover:decoration-o29-ochre disabled:text-o29-slate",
      },
      size: {
        default: "px-6 py-3",
        sm: "px-4 py-2 text-meta",
        lg: "px-10 py-4",
        icon: "min-w-hit p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    (<Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />)
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
