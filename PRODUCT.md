# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js/React. [User chose "Framework (Next.js/React)" over static HTML/CSS.]

## Users

Couples and event organizers planning a wedding or event, comparing florists before committing. They land on the site while shopping around, want a credible instant price estimate without having to call or wait for a callback, then decide whether to reach out.

## Product Purpose

A showcase website for a fictional florist, "La Fleur de la Paix," built around an interactive quote generator: the visitor picks composition type and size, gets an instant estimated price, then contacts the florist with that quote in hand. School project (fictional business), but built to read as a credible, premium, real-world florist site.

## Positioning

Most florist sites push visitors to "request a quote" and wait days for a human reply. This site's mechanism is the opposite: transparent, instant, rule-based pricing shown on-screen before any contact is made — the visitor never has to ask "roughly how much would this cost me" in the dark.

## Operating Context

Visitor browses on desktop or mobile, moves through a wizard-style quote flow (occasion/composition type → size → resulting estimate), then reaches a contact step to send that quote to the florist. No account or login involved.

## Capabilities and Constraints

- Quote pricing is rule-based (deterministic), driven by composition type × size — confirmed as the pricing basis; no delivery/urgency/flower-grade multipliers in this version.
- Exact price figures, the composition catalog, and delivery/contact details are fictional placeholder content for the school project (no real florist data exists) — must be invented consistently and clearly treated as fabricated, not sourced.
- No backend/database requirement confirmed yet; quote logic can run client-side. Whether requested quotes need to be persisted (e.g., a florist-facing back-office) is undecided — not requested so far.
- No user authentication.

## Brand Commitments

- Name: "La Fleur de la Paix."
- Visual identity is binding per the user's explicit brief: white/off-white ground with rose as the single accent color; classical, elegant, premium tone; headline typography is a readable script/calligraphic face (referenced against Edwardian Script, but more legible — e.g. Great Vibes or Playfair Display italic in that family) paired with a sober serif or sans-serif for body text.

## Evidence on Hand

None. This is a fictional business for a school project — no real photography, pricing, testimonials, or copy exist yet. All content (catalog, prices, imagery, contact info) will be invented and must read as plausible placeholder content, not presented as real sourced facts.

## Product Principles

1. Instant, visible pricing logic beats "contact us for a quote" friction — the mechanism is the product.
2. Every screen should read as classical/premium, never generic or templated — this is the brief's non-negotiable.
3. Wedding/event visitors are mid-decision, not impulse buyers — guide them through a short wizard rather than a long intimidating form.
4. Every price shown must be traceable to the visible rule (composition type × size), which keeps the demo pedagogically honest.
