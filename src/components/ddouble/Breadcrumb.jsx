import { Link } from "react-router-dom";

/**
 * Breadcrumbs in the metadata voice — 11px uppercase, slash-separated, which
 * is the same separator the trail already used. The colours resolve through
 * the active colour field, so the trail stays legible if it ever sits on one.
 */
export default function Breadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="px-gutter py-4">
      <ol className="o29-meta flex flex-wrap items-center gap-2 text-field-muted">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true">/</span>}
            {item.href ? (
              <Link
                to={item.href}
                className="flex min-h-hit items-center transition-colors duration-instant hover:text-field-fg"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-field-fg" aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
