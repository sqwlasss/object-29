import { Link } from "react-router-dom";
import { BUSINESS } from "@/config/business";
import Seo from "@/components/Seo";
import Navbar from "@/components/ddouble/Navbar";
import Footer from "@/components/ddouble/Footer";
import FadeIn from "@/components/ddouble/FadeIn";

/* TODO: fill in real legal entity name/address/VAT before launch */

export default function Terms() {
  return (
    <div className="bg-o29-bone min-h-screen">
      <Seo
        title="Terms of Service — ØBJECT 29"
        description="The terms that apply when you use the ØBJECT 29 store and place an order: orders, pricing, shipping, returns, and our responsibilities."
        canonicalPath="/terms"
      />
      <Navbar />

      <main id="main">
        <div className="pt-28 md:pt-36 pb-24 md:pb-32 px-6 md:px-10 lg:px-16 max-w-3xl mx-auto">
          <FadeIn>
            <span className="text-[11px] uppercase tracking-[0.2em] text-o29-slate">Legal</span>
            <h1 className="mt-4 font-display text-h1 font-medium text-o29-ink">Terms of Service</h1>
            <p className="mt-4 text-sm text-o29-slate">
              Last updated: July 2025. These terms are written in plain language. They govern your
              use of the ØBJECT 29 store and the orders you place with us.
            </p>
          </FadeIn>

          <div className="mt-16 md:mt-24 space-y-12">
            <FadeIn>
              <div>
                <h2 className="text-sm font-medium text-o29-ink tracking-wide">Who operates the store</h2>
                <p className="mt-3 text-sm text-o29-slate leading-relaxed">
                  The ØBJECT 29 store is operated by {BUSINESS.legalName}, {BUSINESS.registeredAddress}. By
                  using this store and placing an order, you agree to these terms.
                </p>
              </div>
            </FadeIn>

            <FadeIn>
              <div>
                <h2 className="text-sm font-medium text-o29-ink tracking-wide">Placing an order</h2>
                <p className="mt-3 text-sm text-o29-slate leading-relaxed">
                  When you place an order you are making an offer to buy the products in your cart.
                  We confirm your order by email once payment is processed; at that point a contract
                  between you and us is formed. We may decline an order — for example if a product
                  is unavailable or we suspect fraud — and in that case we'll refund any payment
                  you've made.
                </p>
              </div>
            </FadeIn>

            <FadeIn>
              <div>
                <h2 className="text-sm font-medium text-o29-ink tracking-wide">Prices and payment</h2>
                <p className="mt-3 text-sm text-o29-slate leading-relaxed">
                  Prices are shown in the currency you select and include any applicable taxes at
                  checkout. Shipping costs are shown before you pay. We accept the payment methods
                  offered at checkout, which are handled by Shopify's secure hosted checkout.
                </p>
              </div>
            </FadeIn>

            <FadeIn>
              <div>
                <h2 className="text-sm font-medium text-o29-ink tracking-wide">Shipping and returns</h2>
                <p className="mt-3 text-sm text-o29-slate leading-relaxed">
                  We aim to dispatch every order quickly and carefully packaged. Delivery times,
                  costs, and customs details are described on our{" "}
                  <Link to="/shipping" className="text-o29-ink underline underline-offset-4">
                    shipping page
                  </Link>
                  . If you change your mind, you can return items within 30 days — full details on
                  our{" "}
                  <Link to="/returns" className="text-o29-ink underline underline-offset-4">
                    returns page
                  </Link>
                  .
                </p>
              </div>
            </FadeIn>

            <FadeIn>
              <div>
                <h2 className="text-sm font-medium text-o29-ink tracking-wide">Artwork and intellectual property</h2>
                <p className="mt-3 text-sm text-o29-slate leading-relaxed">
                  The artwork you buy from us remains the intellectual property of its artists. Your
                  purchase gives you the physical print for personal use; you may not reproduce,
                  resell, or redistribute the artwork commercially without permission.
                </p>
              </div>
            </FadeIn>

            <FadeIn>
              <div>
                <h2 className="text-sm font-medium text-o29-ink tracking-wide">Our responsibility</h2>
                <p className="mt-3 text-sm text-o29-slate leading-relaxed">
                  We take care that products match their descriptions and arrive in good condition.
                  If something arrives damaged or faulty, contact us and we'll make it right — see
                  our returns page. Nothing in these terms limits your statutory rights as a
                  consumer.
                </p>
              </div>
            </FadeIn>

            <FadeIn>
              <div>
                <h2 className="text-sm font-medium text-o29-ink tracking-wide">Governing law</h2>
                <p className="mt-3 text-sm text-o29-slate leading-relaxed">
                  These terms are governed by the laws of the country where {BUSINESS.legalName} is
                  registered, without prejudice to any mandatory consumer-protection rights you have
                  under the law of your country of residence.
                </p>
              </div>
            </FadeIn>

            <FadeIn>
              <div>
                <h2 className="text-sm font-medium text-o29-ink tracking-wide">Contact</h2>
                <p className="mt-3 text-sm text-o29-slate leading-relaxed">
                  Questions about these terms? Write to {BUSINESS.legalName}, {BUSINESS.registeredAddress},
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
