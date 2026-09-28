import Seo from "@/components/Seo";
import { BUSINESS } from "@/config/business";
import Navbar from "@/components/ddouble/Navbar";
import Footer from "@/components/ddouble/Footer";
import FadeIn from "@/components/ddouble/FadeIn";

/* TODO: fill in real legal entity name/address/VAT before launch */

export default function Privacy() {
  return (
    <div className="bg-o29-bone min-h-screen">
      <Seo
        title="Privacy Policy — ØBJECT 29"
        description="How ØBJECT 29 collects, uses, and protects your data: accounts, orders, address autocomplete, cookies, and your rights."
        canonicalPath="/privacy"
      />
      <Navbar />

      <main id="main">
        <div className="pt-28 md:pt-36 pb-24 md:pb-32 px-6 md:px-10 lg:px-16 max-w-3xl mx-auto">
          <FadeIn>
            <span className="text-[11px] uppercase tracking-[0.2em] text-o29-slate">Legal</span>
            <h1 className="mt-4 font-display text-h1 font-medium text-o29-ink">Privacy Policy</h1>
            <p className="mt-4 text-sm text-o29-slate">
              Last updated: July 2025. This policy explains in plain language what data ØBJECT 29
              collects, why we collect it, and the choices you have.
            </p>
          </FadeIn>

          <div className="mt-16 md:mt-24 space-y-12">
            <FadeIn>
              <div>
                <h2 className="text-sm font-medium text-o29-ink tracking-wide">Who we are</h2>
                <p className="mt-3 text-sm text-o29-slate leading-relaxed">
                  ØBJECT 29 is an online art print store operated by {BUSINESS.legalName}, with its
                  registered address at {BUSINESS.registeredAddress}. You can reach us at any time at{" "}
                  <a href="mailto:hello@ddouble.com" className="text-o29-ink underline underline-offset-4">
                    hello@ddouble.com
                  </a>
                  .
                </p>
              </div>
            </FadeIn>

            <FadeIn>
              <div>
                <h2 className="text-sm font-medium text-o29-ink tracking-wide">Data we collect</h2>
                <div className="mt-3 space-y-4 text-sm text-o29-slate leading-relaxed">
                  <p>
                    <strong className="text-o29-ink font-medium">Account data.</strong> When you
                    create an account, we store your name, email address, and login credentials.
                    Accounts are handled by Firebase, Google's authentication service, which stores
                    your password in an encrypted form — we never see or store your password in
                    plain text.
                  </p>
                  <p>
                    <strong className="text-o29-ink font-medium">Address autocomplete.</strong> To
                    make checkout faster, the address fields use Google Maps address autocomplete.
                    The addresses you search for are sent to Google to suggest matches; Google's
                    use of this data is governed by Google's own privacy policy.
                  </p>
                  <p>
                    <strong className="text-o29-ink font-medium">Cart and order data.</strong> We
                    store the items in your cart and, when you place an order, your order details —
                    items, quantities, prices, shipping and billing address, and contact email.
                    Orders are processed through Shopify's infrastructure.
                  </p>
                  <p>
                    <strong className="text-o29-ink font-medium">Local storage.</strong> Your
                    browser's local storage keeps a small amount of data so the store works
                    correctly: your cart ID, currency preference, favourites and wishlist lists, and
                    a token that keeps you logged in.
                  </p>
                </div>
              </div>
            </FadeIn>

            <FadeIn>
              <div>
                <h2 className="text-sm font-medium text-o29-ink tracking-wide">How we use your data</h2>
                <p className="mt-3 text-sm text-o29-slate leading-relaxed">
                  We use your data only to run the store: to process and deliver your orders, to
                  keep you logged in and manage your account, to remember your preferences (like
                  currency and favourites), and to respond to your questions. Analytics data is
                  used in aggregate to understand how the store is used and to improve it — never
                  to sell your personal information.
                </p>
              </div>
            </FadeIn>

            <FadeIn>
              <div>
                <h2 className="text-sm font-medium text-o29-ink tracking-wide">Retention</h2>
                <p className="mt-3 text-sm text-o29-slate leading-relaxed">
                  We keep account data for as long as your account is active. Order records are kept
                  as long as required by applicable accounting and tax law. Local storage data stays
                  on your device until you clear it or delete your account. You can ask us at any
                  time to delete your personal data — see "Your rights" below.
                </p>
              </div>
            </FadeIn>

            <FadeIn>
              <div>
                <h2 className="text-sm font-medium text-o29-ink tracking-wide">Third parties</h2>
                <p className="mt-3 text-sm text-o29-slate leading-relaxed">
                  To operate the store we share data with a small number of trusted providers:
                  Firebase and Google (authentication, analytics, and address autocomplete), and
                  Shopify (cart, checkout, and payment processing). Each provider processes your
                  data under its own terms and only for the purpose of providing that service.
                </p>
              </div>
            </FadeIn>

            <FadeIn>
              <div>
                <h2 className="text-sm font-medium text-o29-ink tracking-wide">Cookies</h2>
                <p className="mt-3 text-sm text-o29-slate leading-relaxed">
                  We use a small number of cookies and similar technologies. Necessary cookies keep
                  your cart and login working, and analytics cookies (via Firebase Analytics) help
                  us understand how the store is used so we can improve it.
                </p>
              </div>
            </FadeIn>

            <FadeIn>
              <div>
                <h2 className="text-sm font-medium text-o29-ink tracking-wide">Your rights</h2>
                <p className="mt-3 text-sm text-o29-slate leading-relaxed">
                  Depending on where you live, you may have the right to access the data we hold
                  about you, to correct it, to ask us to delete it, and to object to or restrict
                  certain processing. To exercise any of these rights, or if you have a question
                  about your data, just email us at{" "}
                  <a href="mailto:hello@ddouble.com" className="text-o29-ink underline underline-offset-4">
                    hello@ddouble.com
                  </a>{" "}
                  and we'll help.
                </p>
              </div>
            </FadeIn>

            <FadeIn>
              <div>
                <h2 className="text-sm font-medium text-o29-ink tracking-wide">Contact</h2>
                <p className="mt-3 text-sm text-o29-slate leading-relaxed">
                  Questions about this policy? Write to {BUSINESS.legalName}, {BUSINESS.registeredAddress},
                  or email{" "}
                  <a href="mailto:hello@ddouble.com" className="text-o29-ink underline underline-offset-4">
                    hello@ddouble.com
                  </a>
                  .
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
