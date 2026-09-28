import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Border is `o29-edge`, not `o29-rule`. Edge is 3.66:1 on bone and 3.29:1 on
 * bone-2, so a field's boundary clears WCAG 1.4.11 on both grounds; rule is
 * 1.29:1 and is decorative only. A form field whose border a low-vision user
 * cannot see is not a form field.
 *
 * `min-h-hit` puts the control on the 44px tap floor. Focus comes from the
 * single global :focus-visible rule, whose colour each colour field sets for
 * itself — no component may add outline-none.
 */
const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    (<input
      type={type}
      className={cn(
        "flex min-h-hit w-full rounded-none border border-o29-edge bg-transparent px-3 py-2 text-base text-o29-ink transition-colors duration-instant",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-o29-ink",
        "placeholder:text-o29-slate",
        "hover:border-o29-ink",
        "disabled:cursor-not-allowed disabled:border-o29-rule disabled:bg-o29-bone-2 disabled:text-o29-slate",
        "md:text-sm",
        className
      )}
      ref={ref}
      {...props} />)
  );
})
Input.displayName = "Input"

export { Input }
