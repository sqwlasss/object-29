import { Link } from 'react-router-dom';
import Seo from '@/components/Seo';
import Navbar from '@/components/ddouble/Navbar';
import Footer from '@/components/ddouble/Footer';
import MetaLabel from '@/components/o29/MetaLabel';
import { STAMP } from '@/config/editorial';

/**
 * The one licensed joke in the system: a sky room containing a doorway that
 * opens onto nothing.
 *
 * The artworks this brand sells have a Great Dane, a pink squiggle lamp and an
 * egg painting in them. A system with no capacity for wit is not this brand —
 * but wit is budgeted at one moment for the whole site, and this is it,
 * because a 404 is the one page where nobody is trying to buy anything.
 *
 * Removed here: a Base44 scaffolding block that told signed-in "admin" users
 * "This could mean that the AI hasn't implemented this page yet" (dead code —
 * `user.role` is never set by this app's auth), and a `window.location.href`
 * assignment that did a full page reload instead of a client-side navigation.
 */
export default function PageNotFound() {
  return (
    <div className="o29-field o29-field--sky min-h-screen">
      <Seo noindex title="Location undefined — ØBJECT 29" canonicalPath={null} />
      <Navbar />

      <main id="main" className="pt-header">
        <section className="relative mx-auto w-full max-w-page overflow-clip px-gutter py-hold">
          {/* The doorway, opening onto nothing. */}
          <div
            aria-hidden="true"
            className="absolute inset-y-0 right-0 hidden w-[16%] bg-o29-vermilion md:block"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-[8%] bg-o29-vermilion md:hidden"
          />

          <div className="relative max-w-lead">
            <MetaLabel items={STAMP.notFound} />
            <h1 className="mt-8 font-display text-display font-medium text-field-fg">
              There is no room here.
            </h1>
            <p className="mt-tight max-w-reading text-lead text-field-fg">
              The page you asked for does not exist. That is not a metaphor —
              the address is simply wrong.
            </p>
            <Link
              to="/"
              className="o29-meta mt-tight inline-flex min-h-hit items-center border-b border-current pb-1 text-field-fg transition-colors duration-instant hover:text-o29-vermilion"
            >
              Back to somewhere real
            </Link>
          </div>
        </section>
      </main>

      <Footer tone="ink" />
    </div>
  );
}
