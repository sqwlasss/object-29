import Navbar from "@/components/ddouble/Navbar";
import Footer from "@/components/ddouble/Footer";
import ColourField from "@/components/o29/ColourField";

/**
 * The page wrapper 13 page files currently hand-repeat as
 * `<div className="bg-[#F9F9F7] min-h-screen"><Seo/><Navbar/><main id="main">…<Footer/></div>`.
 *
 * Deliberately an OPT-IN COMPONENT that pages import, NOT a <Route element>
 * layout. Two reasons:
 *
 *  1. Every page is React.lazy. A layout route would change where the Suspense
 *     boundary sits and how route-scoped effects run — Navbar closes its
 *     menus via a `location.pathname` effect and currently remounts per route.
 *
 *  2. The colour-field mechanism depends on <Navbar> being a DOM DESCENDANT of
 *     the page root, so the root's custom properties inherit into the fixed
 *     header. Hoisting Navbar above <Routes> silently breaks the inverted
 *     chrome on every colour page.
 *
 * `tone` sets the page ground and inverts the header and footer chrome with it.
 * `footerTone` follows the footer-by-intent rule: vermilion on pages whose job
 * is seduction (Home, About, Contact), ink on pages whose job is transaction
 * (Shop, Product, Favorites, account, policy). That is what stops red becoming
 * wallpaper — a shopper deep in the catalogue can go a whole session without
 * seeing it, which is exactly why it lands when they do.
 *
 * Not adopted yet: created in stage 3, applied from stage 5 onward.
 */
export default function PageShell({
  tone = "bone",
  footerTone = "ink",
  children,
  seo = null,
  className = "",
}) {
  return (
    <ColourField as="div" tone={tone} className={`min-h-screen ${className}`}>
      {seo}
      <Navbar />
      <main id="main">{children}</main>
      <Footer tone={footerTone} />
    </ColourField>
  );
}
