/**
 * Availability.
 *
 * The state is never carried by hue alone — each one pairs a distinct mark
 * (outlined square / filled square) with its own words, so it survives colour
 * blindness, greyscale printing and forced-colors mode. The marks are squares
 * because the system has no radius; the old build used raw Tailwind
 * red-500 / green-500 / orange-400 dots, which belong to no palette here.
 *
 * There is deliberately no green in this system. "In stock" is the quiet
 * default state and does not need to celebrate itself.
 *
 * NOTE: the low-stock branch is currently unreachable — `quantityAvailable` is
 * selected by none of the Storefront queries, so it is always undefined. It is
 * kept because adding the field to the query is a one-line change; it must not
 * be "simplified away" and then silently reintroduced as a fabricated number.
 */
export default function StockIndicator({ variant }) {
  const quantity = variant?.quantityAvailable;

  let status;
  let markClass;
  let textClass = "text-o29-slate";

  if (variant && !variant.availableForSale) {
    status = "Out of stock";
    markClass = "bg-o29-vermilion";
    textClass = "text-o29-vermilion";
  } else if (quantity !== undefined && quantity !== null && quantity === 0) {
    status = "Out of stock";
    markClass = "bg-o29-vermilion";
    textClass = "text-o29-vermilion";
  } else if (quantity !== undefined && quantity !== null && quantity <= 5) {
    status = `Low stock — only ${quantity} left`;
    markClass = "bg-o29-ochre";
    textClass = "text-o29-ink";
  } else {
    status = "In stock";
    markClass = "border border-o29-edge";
  }

  return (
    <p className="mt-3 flex items-center gap-2">
      <span aria-hidden="true" className={`h-2 w-2 shrink-0 ${markClass}`} />
      <span className={`o29-meta ${textClass}`}>{status}</span>
    </p>
  );
}
