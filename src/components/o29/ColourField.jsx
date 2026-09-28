import { cn } from "@/lib/utils";

/**
 * A colour field — a wall, with its own foreground, hairline, control border
 * and focus-ring colours. Everything inside it reads those through CSS custom
 * properties, so chrome inverts with zero per-page conditionals.
 *
 * Put it on a <section> for a band, or set `asPageRoot` on a page's outermost
 * div to invert the ENTIRE page including the fixed header — <Navbar> renders
 * its `position: fixed` <header> inside each page's root div, so the custom
 * properties inherit into it through the DOM.
 *
 * KEEP IT THAT WAY: hoisting <Navbar> above <Routes> into a shared layout
 * route would silently break the inverted chrome on every colour page.
 *
 * The class names are a literal lookup map on purpose. Tailwind tree-shakes
 * custom classes declared in `@layer base`, and a template literal like
 * `o29-field--${tone}` is invisible to its scanner — the class would be purged
 * and the field would render as an unstyled bone page. (tailwind.config.js
 * also safelists them as a backstop.)
 */
const FIELD_CLASS = {
  bone: "o29-field--bone",
  ink: "o29-field--ink",
  cobalt: "o29-field--cobalt",
  vermilion: "o29-field--vermilion",
  olive: "o29-field--olive",
  sky: "o29-field--sky",
};

export const FIELD_TONES = Object.keys(FIELD_CLASS);

export default function ColourField({
  tone = "bone",
  as: Tag = "section",
  wall = false,
  className = "",
  children,
  ...rest
}) {
  const toneClass = FIELD_CLASS[tone] ?? FIELD_CLASS.bone;

  return (
    <Tag
      className={cn(
        "o29-field",
        toneClass,
        // `wall` is OPT-IN. A wall owns at least 82svh of screen — that is what
        // separates a field from a banner, and banners are what the brief
        // rejects. But plenty of coloured surfaces are not walls: the footer,
        // the cart drawer, the mobile menu and the cookie bar all size to
        // their content. Forcing a minimum height on those makes a footer
        // taller than the page it ends.
        wall && "min-h-field",
        className
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}
