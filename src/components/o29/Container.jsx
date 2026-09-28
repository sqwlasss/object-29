import { cn } from "@/lib/utils";

/**
 * The page measure. Replaces the `max-w-[1440px] mx-auto px-6 md:px-10 lg:px-16`
 * incantation repeated across 13 page files.
 *
 * `bleed` opts an element out of the measure so it can run full width — the
 * colour fields, the hero room, the doorway band.
 */
export default function Container({ as: Tag = "div", bleed = false, className = "", children, ...rest }) {
  return (
    <Tag
      className={cn(!bleed && "mx-auto w-full max-w-page px-gutter", className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}
