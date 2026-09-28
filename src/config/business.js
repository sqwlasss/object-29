// src/config/business.js
//
// Every real-world fact the storefront states about the business, in one
// place, because these are the claims that carry legal and consumer weight
// and they were previously scattered across six page files.
//
// ⚠️ OWNER ACTION REQUIRED — the values below were inherited from the previous
// brand and NONE of them have been verified. They are centralised rather than
// rewritten, because inventing a business address is worse than leaving a
// stale one, and deleting one that turns out to be real is worse still.
//
// Check and correct each field, then delete this notice.

export const BUSINESS = {
  /** Public brand name. Safe — this one is correct. */
  name: "ØBJECT 29",

  /** ⚠️ Inherited from the previous brand. Almost certainly wrong. */
  email: "hello@ddouble.com",

  /**
   * ⚠️ Inherited. Appears on /contact as "Studio".
   * Set `address: null` to stop rendering the block entirely rather than
   * showing an address that is not yours.
   */
  address: {
    line1: "Nørrebrogade 45",
    line2: "2200 Copenhagen N",
    country: "Denmark",
  },

  /** ⚠️ Inherited. */
  hours: "Monday – Friday, 9:00 – 17:00 CET",

  /**
   * ⚠️ NOT FILLED IN. These render literally as "[Company legal name]" on the
   * live Privacy, Terms, Shipping and Returns pages today, behind a TODO that
   * predates this rebrand. Consumer law in most jurisdictions requires a
   * trading name and a registered address on a storefront.
   */
  legalName: "[Company legal name]",
  registeredAddress: "[Registered address]",
  vat: "[VAT number]",

  /** Social. Inherited handle — update alongside the rename. */
  instagram: "https://www.instagram.com/theddouble/",
};

/**
 * ⚠️ NEITHER FORM ON THIS SITE SENDS ANYWHERE.
 *
 * The contact form and the newsletter signup both set a local "submitted"
 * flag and show a confirmation — "Thank you, we'll get back to you shortly" —
 * without transmitting or storing anything. A confirmation for a message
 * nobody received is the same class of problem as an invented testimonial.
 *
 * Set this to true only once a real endpoint exists (with server-side rate
 * limiting). While it is false, both forms tell the visitor the truth and
 * point them at the email address instead.
 */
export const FORMS_ARE_WIRED = false;
