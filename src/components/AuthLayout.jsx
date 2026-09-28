import React from "react";
import { Link } from "react-router-dom";
import MetaLabel from "@/components/o29/MetaLabel";

/**
 * The auth shell: sky ground, ink type, and no site chrome to fight.
 *
 * Sky is the honest resolution of the brief's "optional muted lavender" — it
 * is the artworks' own dusty ceiling-blue rather than the cobalt-and-lavender
 * of every AI-startup landing page. It appears here and on the 404, and
 * nowhere else in the site.
 *
 * Ink on sky is 8.21:1. Slate is only 3.10:1 on this ground and is therefore
 * forbidden here — the field sets `--fg-muted` to ink for exactly that reason,
 * so anything reading `text-field-muted` stays legible.
 */
export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="o29-field o29-field--sky flex min-h-screen flex-col">
      <header className="mx-auto w-full max-w-page px-gutter py-6">
        <Link
          to="/"
          className="flex min-h-hit items-center font-display text-sm font-medium tracking-[0.12em] text-field-fg"
        >
          ØBJECT&nbsp;29
        </Link>
      </header>

      <main id="main" className="flex flex-1 items-center justify-center px-gutter py-tight">
        <div className="w-full max-w-md">
          <div className="mb-tight">
            {Icon && (
              <span className="mb-6 inline-flex h-12 w-12 items-center justify-center bg-o29-ink">
                <Icon className="h-5 w-5 text-o29-bone" aria-hidden="true" />
              </span>
            )}
            <h1 className="font-display text-h2 font-medium text-field-fg">{title}</h1>
            {subtitle && <p className="mt-3 text-sm text-field-muted">{subtitle}</p>}
          </div>

          <div className="border border-control bg-o29-bone p-8">{children}</div>

          {footer && <p className="mt-6 text-center text-sm text-field-fg">{footer}</p>}
        </div>
      </main>

      <footer className="mx-auto w-full max-w-page px-gutter py-6">
        <MetaLabel items={["ØBJECT 29", "Art for another reality"]} className="text-field-muted" />
      </footer>
    </div>
  );
}
