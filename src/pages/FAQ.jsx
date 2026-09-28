import { useMemo } from "react";
import Navbar from "@/components/ddouble/Navbar";
import Footer from "@/components/ddouble/Footer";
import Seo from "@/components/Seo";
import FadeIn from "@/components/ddouble/FadeIn";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ_SECTIONS = [
  {
    title: "Orders & Shipping",
    items: [
      {
        q: "How long does shipping take?",
        a: "Standard shipping within Europe takes 3–7 business days. Express delivery (1–3 days) is available at checkout. All orders are carefully packaged in reinforced tubes to protect your prints.",
      },
      {
        q: "Do you ship internationally?",
        a: "Yes, we ship worldwide. Shipping is free above the threshold shown in your cart; below it, cost is calculated at checkout based on your destination.",
      },
      {
        q: "Can I track my order?",
        a: "Absolutely. Once your order ships, you'll receive a tracking number via email so you can follow your package every step of the way.",
      },
    ],
  },
  {
    title: "Returns & Exchanges",
    items: [
      {
        q: "What is your return policy?",
        a: "We offer a 30-day hassle-free return policy. If you're not completely satisfied with your purchase, return it in its original packaging for a full refund.",
      },
      {
        q: "Can I exchange a print for a different size?",
        a: "Yes. Contact us within 30 days of receiving your order and we'll arrange an exchange. The print must be in its original, undamaged condition.",
      },
    ],
  },
  {
    title: "Products & Quality",
    items: [
      {
        q: "What paper do you use?",
        a: "Paper stock, finish and print method are listed in the specification on each product page, because they vary by object.",
      },
      {
        q: "What sizes are available?",
        a: "Our prints are available in five sizes: 21×30 cm, 30×40 cm, 40×50 cm, 50×70 cm, and 70×100 cm. Size availability may vary by design.",
      },
      {
        q: "Do prints come framed?",
        a: "Prints are sold unframed by default. We offer premium frames in Black Oak, Natural Oak, White Oak, and Dark Walnut that can be added during checkout.",
      },
    ],
  },
  {
    title: "About ØBJECT 29",
    items: [
      {
        q: "Where are your prints made?",
        a: "Production and packaging details are listed on each product page. Where an object has specific material or sourcing information, it appears in its specification.",
      },
      {
        q: "Do you collaborate with artists?",
        a: "Yes. We work with emerging and established artists, photographers, and designers from across Europe. If you're an artist interested in collaborating, reach out via our contact page.",
      },
    ],
  },
];

export default function FAQ() {
  const faqJsonLd = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ_SECTIONS.flatMap((section) =>
        section.items.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.a,
          },
        }))
      ),
    }),
    []
  );

  return (
    <div className="bg-o29-bone min-h-screen">
      <Seo
        title="FAQ — ØBJECT 29"
        description="Answers on ordering, shipping, returns, sizes, and print quality — everything you need to know about ordering from ØBJECT 29."
        canonicalPath="/faq"
        jsonLd={faqJsonLd}
      />
      <Navbar />
      <main id="main">
      <div className="pt-28 md:pt-36 pb-24 md:pb-32 px-6 md:px-10 lg:px-16 max-w-3xl mx-auto">
        <FadeIn>
          <span className="text-[11px] uppercase tracking-[0.2em] text-o29-slate">Help</span>
          <h1 className="mt-4 font-display text-h1 font-medium text-o29-ink">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-sm text-o29-slate">
            Everything you need to know about ordering, shipping, and our prints.
          </p>
        </FadeIn>

        <div className="mt-16 md:mt-24 space-y-12">
          {FAQ_SECTIONS.map((section, si) => (
            <FadeIn key={si} delay={si * 0.08}>
              <div>
                <h2 className="text-[11px] uppercase tracking-[0.2em] text-o29-slate mb-4">{section.title}</h2>
                <Accordion type="single" collapsible>
                  {section.items.map((item, i) => (
                    <AccordionItem key={i} value={`${si}-${i}`} className="border-b border-o29-rule">
                      <AccordionTrigger className="text-sm text-o29-ink font-normal hover:no-underline py-5 text-left">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-o29-slate leading-relaxed pb-5">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
      </main>

      <Footer />
    </div>
  );
}
