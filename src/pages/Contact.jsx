import { useState } from "react";
import { Mail, MapPin } from "lucide-react";
import Seo from "@/components/Seo";
import Navbar from "@/components/ddouble/Navbar";
import Footer from "@/components/ddouble/Footer";
import Reveal from "@/components/motion/Reveal";
import { BUSINESS, FORMS_ARE_WIRED } from "@/config/business";

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  // There is no endpoint behind this form. Until FORMS_ARE_WIRED is true it
  // must not claim a message was sent — see src/config/business.js.
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!FORMS_ARE_WIRED) return;
    setSubmitted(true);
  };

  return (
    <div className="bg-o29-bone min-h-screen">
      <Seo
        title="Contact — ØBJECT 29"
        description="Questions about an order, shipping or returns? Get in touch with ØBJECT 29."
        canonicalPath="/contact"
      />
      <Navbar />

      <main id="main">
      <div className="pt-28 md:pt-36 pb-24 md:pb-32 px-6 md:px-10 lg:px-16 max-w-[1440px] mx-auto">
        <Reveal>
          <span className="text-[11px] uppercase tracking-[0.2em] text-o29-slate">Get in touch</span>
          <h1 className="mt-4 font-display text-h1 font-medium text-o29-ink">Contact</h1>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 md:gap-24 mt-16 md:mt-24">
          {/* Form */}
          <Reveal>
            {!FORMS_ARE_WIRED ? (
              /* No endpoint exists behind this form. Rather than accepting a
                 message into nothing and thanking the sender for it, the page
                 says so and hands over a route that actually works. Flip
                 FORMS_ARE_WIRED in src/config/business.js once it is real. */
              <div>
                <p className="max-w-reading text-lead text-o29-ink">
                  The quickest way to reach us is email — we read everything that
                  arrives there.
                </p>
                <a
                  href={`mailto:${BUSINESS.email}`}
                  className="o29-meta mt-8 inline-flex min-h-hit items-center border-b border-o29-edge pb-1 text-o29-ink transition-colors duration-instant hover:border-o29-ochre"
                >
                  {BUSINESS.email}
                </a>
              </div>
            ) : submitted ? (
              <div className="py-16">
                <h2 className="font-display text-h3 font-medium text-o29-ink">Thank you</h2>
                <p className="mt-4 text-sm text-o29-slate">We&rsquo;ll get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="contact-name" className="text-[11px] uppercase tracking-[0.15em] text-o29-slate">Name</label>
                  <input
                    id="contact-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="mt-2 w-full bg-transparent border-b border-o29-edge py-3 text-sm text-o29-ink focus:border-o29-ink transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="text-[11px] uppercase tracking-[0.15em] text-o29-slate">Email</label>
                  <input
                    id="contact-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    required
                    className="mt-2 w-full bg-transparent border-b border-o29-edge py-3 text-sm text-o29-ink focus:border-o29-ink transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="contact-message" className="text-[11px] uppercase tracking-[0.15em] text-o29-slate">Message</label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                    className="mt-2 w-full bg-transparent border-b border-o29-edge py-3 text-sm text-o29-ink focus:border-o29-ink transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-o29-ink text-o29-bone text-xs uppercase tracking-[0.15em] px-8 py-4 hover:bg-o29-cobalt transition-all duration-300"
                >
                  Send Message
                </button>
              </form>
            )}
          </Reveal>

          {/* Info */}
          <Reveal delay={0.1}>
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Mail size={14} className="text-o29-slate" />
                  <h3 className="text-[11px] uppercase tracking-[0.15em] text-o29-slate">Email</h3>
                </div>
                <a href={`mailto:${BUSINESS.email}`} className="text-sm text-o29-ink hover:text-o29-slate transition-colors">{BUSINESS.email}</a>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={14} className="text-o29-slate" />
                  <h3 className="text-[11px] uppercase tracking-[0.15em] text-o29-slate">Studio</h3>
                </div>
                <p className="text-sm text-o29-ink">{BUSINESS.address.line1}<br />{BUSINESS.address.line2}<br />{BUSINESS.address.country}</p>
              </div>
              <div>
                <h3 className="text-[11px] uppercase tracking-[0.15em] text-o29-slate mb-3">Business Hours</h3>
                <p className="text-sm text-o29-ink">
                  {BUSINESS.hours}
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
      </main>

      <Footer tone="vermilion" />
    </div>
  );
}
