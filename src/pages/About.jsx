import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import Navbar from "@/components/ddouble/Navbar";
import Footer from "@/components/ddouble/Footer";
import Reveal from "@/components/motion/Reveal";
import ColourField from "@/components/o29/ColourField";
import MetaLabel from "@/components/o29/MetaLabel";

/**
 * The manifesto. Olive throughout — the only page in the site that uses it —
 * with one full-bleed bone interruption, and a vermilion footer. Olive meeting
 * vermilion across a hard edge is the relationship in the reference artworks,
 * and this is the only place those two are allowed to touch.
 *
 * WHAT WAS DELETED, AND WHY
 *
 * The previous copy claimed a Copenhagen studio, museum-grade paper, archival
 * inks, collaborations with artists across Europe, and fully sustainable
 * packaging. None of it is verifiable from this repository, and a shop that
 * invents its own provenance is doing the same thing as a shop that invents
 * customer testimonials.
 *
 * What replaces it says only what the work is. If any of those production
 * claims are true, they belong here with real detail — paper weight, printer,
 * where it ships from — not as adjectives.
 */
export default function About() {
  return (
    <div className="o29-field o29-field--olive min-h-screen">
      <Seo
        title="Reality is only the starting point — ØBJECT 29"
        description="ØBJECT 29 makes contemporary surreal art: impossible rooms, altered scale, and objects placed where they could not be."
        canonicalPath="/about"
      />
      <Navbar />

      <main id="main" className="pt-header">
        {/* The statement */}
        <section className="relative mx-auto w-full max-w-page overflow-clip px-gutter py-hold">
          <MetaLabel items={["ØBJECT 29", "Manifesto"]} />
          <h1 className="mt-8 max-w-[14ch] font-display text-display font-medium text-field-fg">
            Reality is only the starting point.
          </h1>

          {/* The flat disc: one flat fill, no radial gradient, no shading, no
              shadow. A shaded circle is exactly the generic blob the system
              forbids, and it is not what the artworks' spheres look like.
              Desktop only — it competes for a canvas too small below md. */}
          <span
            aria-hidden="true"
            // `rounded-[50%]`, not `rounded-full`: this is a circle by SHAPE,
            // which the system allows, and the distinction keeps the guard's
            // ban on `rounded-*` as a surface treatment strict.
            className="pointer-events-none absolute -right-16 bottom-[-12%] hidden h-[42vw] max-h-[420px] w-[42vw] max-w-[420px] rounded-[50%] bg-o29-bone md:block"
          />
        </section>

        {/* The bone interruption */}
        <ColourField tone="bone" className="py-hold">
          <div className="mx-auto w-full max-w-page px-gutter">
            <div className="grid gap-tight lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-16">
              <div>
                <MetaLabel items={["What this is"]} className="text-o29-slate" />
              </div>
              <div className="max-w-reading space-y-6 text-lead text-o29-ink">
                <p>
                  ØBJECT 29 makes images of rooms that cannot be entered, objects
                  that refuse their own scale, and light arriving from the wrong
                  direction. The work sits between a set and a photograph: every
                  scene is built, then shot as though it were ordinary.
                </p>
                <p>
                  Nothing here is a document of a real place. The colour is
                  flat, the geometry is deliberate, and the shadow rarely agrees
                  with the light. What looks like an interior is a proposition
                  about one.
                </p>
                <p>
                  Each object is released as an open edition and printed to
                  order. Details of size, framing and materials sit on every
                  product page.
                </p>
              </div>
            </div>
          </div>
        </ColourField>

        {/* Back to olive, and out */}
        <section className="mx-auto w-full max-w-page px-gutter py-hold">
          <Reveal>
            <p className="max-w-lead font-display text-h2 font-medium text-field-fg">
              The work is the argument. Everything else is packaging.
            </p>
            <Link
              to="/shop"
              className="o29-meta mt-tight inline-flex min-h-hit items-center border-b border-current pb-1 text-field-fg transition-colors duration-instant hover:text-o29-ochre"
            >
              See the collection
            </Link>
          </Reveal>
        </section>
      </main>

      <Footer tone="vermilion" />
    </div>
  );
}
