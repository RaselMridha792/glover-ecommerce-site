# glover-ecommerce-site

E-commerce prototype for **Glover Sports** (weareglover.com) — a boxing brand selling gloves,
apparel and equipment, plus an appointment-booking page for training sessions.

Built with Next.js as a clickable prototype for client sign-off. Once the design is approved it
gets rebuilt in WordPress with Elementor + WooCommerce, which is why the data layer below is
shaped to map straight onto WooCommerce concepts.

---

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
```

Node 20+ required. No environment variables, no external services.

---

## Pages

| Route | What it is |
| --- | --- |
| `/` | Home — hero, manifesto, featured products, category tiles, training CTA, founder story, classes, social gallery |
| `/shop` | Product archive: category nav, filter rail (category, collection, colour, size, closure, price, availability), sort, product grid |
| `/shop/[slug]` | Product detail: zoom gallery, variation picker, personalisation, stock states, accordion, size guide, reviews, related products |
| `/about` | Brand story, founder, values, timeline |
| `/services` | Pricing tiers, classes, competitions |
| `/ambassador` | Ambassador program + application form |
| `/contact` | Contact details + enquiry form |
| `/book-training` | Appointment booking flow (session → date → time → details → confirmation) |

---

## Data model

`lib/catalog.ts` is deliberately shaped like a WooCommerce **variable product**, so the migration
is mechanical:

| Prototype | WooCommerce |
| --- | --- |
| `Product` | product post |
| `Product.category` | product category (Boxing Gloves / Apparel / Equipment & Accessories) |
| `Product.collection` | product tag or sub-category |
| `AttributeDef` | global attribute (`pa_colour`, `pa_weight`, `pa_closure`, `pa_size`) |
| `Variation` | `product_variation` post with its own SKU, price, sale price, stock |
| `personalisation` | product add-on / custom field |

Every purchasable combination exists as a concrete variation, so the product page can grey out
combinations that are not stocked exactly the way WooCommerce does.

---

## Design system

`app/globals.css` is a single token-driven stylesheet ported from the approved HTML mockup.
Tokens are flat and semantic (`--ink`, `--cream`, `--gold`, `--font-display`, …) so they map
one-to-one onto Elementor **Global Colors** and **Global Fonts** during the rebuild.

Layout is class-driven — `.cols`, `.grid-3`, `.form-grid`, `.product-grid` — with breakpoints at
980 px, 860 px and 620 px. No inline grid styles, so every block collapses predictably.

---

## Images

Product and lifestyle photography is the client's own, pulled from their live Squarespace store
and processed by `scripts/prep-images.mjs`: studio backgrounds are knocked out with an
edge-connected flood fill so every glove floats on the same tile.

Apparel and equipment have **not been photographed yet**. `scripts/make-product-art.mjs`
generates technical-flat vector stand-ins in the brand palette; those products carry an
`artworkNote` that is shown under the gallery so the placeholder is declared, not implied.
Replace the PNGs in `public/images/products/` with studio shots when they land — no code changes
needed.

Brand marks are processed by `scripts/prep-logos.mjs`.

---

## Prototype boundaries

These are intentionally front-end only and are wired up during the WordPress build:

- **Checkout** — the cart drawer is real (localStorage-backed) but checkout is a stub.
- **Forms** — contact and ambassador forms validate and confirm locally; they do not send mail.
- **Booking** — the flow is complete but does not write to the client's Acuity calendar
  (`gloverboxing.as.me`), which is not published yet.
