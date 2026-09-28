import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

/**
 * Form labels use the system's metadata treatment — 11px, uppercase, .18em —
 * so a field label and an editorial caption are visibly the same voice.
 *
 * `text-field-muted` resolves through whatever colour field the label sits in,
 * so the same component is legible on bone, on the sky auth shell, and inside
 * an ink panel without a single conditional.
 */
const labelVariants = cva(
  "o29-meta text-field-muted leading-none peer-disabled:cursor-not-allowed peer-disabled:text-o29-slate"
)

const Label = React.forwardRef(({ className, ...props }, ref) => (
  <LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props} />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
