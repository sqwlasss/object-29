import { cn } from "@/lib/utils";
import Container from "@/components/o29/Container";

/**
 * Vertical rhythm. Three silences, not a linear ramp — the room is either
 * tight or it is empty.
 *
 *   tight  48 →  96px   inside a section
 *   quiet  96 → 192px   between ordinary sections (the site default)
 *   hold  144 → 288px   REQUIRED before and after every colour field
 *
 * The hold is what makes a wall land when it arrives. Two colour fields may
 * never touch or share a viewport height.
 */
const SPACE = {
  tight: "py-tight",
  quiet: "py-quiet",
  hold: "py-hold",
};

export default function Section({
  space = "quiet",
  bleed = false,
  as = "section",
  className = "",
  children,
  ...rest
}) {
  return (
    <Container as={as} bleed={bleed} className={cn(SPACE[space] ?? SPACE.quiet, className)} {...rest}>
      {children}
    </Container>
  );
}
