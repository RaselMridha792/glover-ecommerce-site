/**
 * Product catalogue.
 *
 * Shaped deliberately like a WooCommerce *variable product*: a parent product
 * carries attribute definitions, and every purchasable combination exists as a
 * concrete variation with its own SKU, price and stock. When this prototype is
 * rebuilt in WordPress the mapping is 1:1 —
 *
 *   Product          -> post (product)
 *   AttributeDef     -> pa_colour / pa_weight / pa_closure (global attributes)
 *   Variation        -> product_variation post
 *   personalisation  -> a WooCommerce product add-on / custom field
 *
 * Copy and pricing come from the client's live Squarespace store
 * (weareglover.com); imagery is their own product photography.
 */

export type AttributeOption = {
  slug: string;
  label: string;
  /** swatch fill for colour attributes */
  hex?: string;
  /** second colour for two-tone swatches */
  accent?: string;
  /** cut-out shot used for the large colour chips on the product page */
  image?: string;
  note?: string;
};

export type AttributeDef = {
  slug: string;
  name: string;
  kind: "swatch" | "pill";
  options: AttributeOption[];
  /**
   * Option the product page opens on. Without this the first in-stock
   * combination wins, which lands on 8 oz — a competition-only weight that
   * misreads as the recommended pick.
   */
  defaultOption?: string;
};

export type Variation = {
  id: string;
  sku: string;
  attrs: Record<string, string>;
  price: number;
  salePrice?: number;
  stock: number;
  image: string;
};

export type ProductImage = {
  src: string;
  alt: string;
  /** cut-out shots get contained + padded, photos get cover-cropped */
  kind: "cutout" | "photo";
  /** ties a gallery frame to a colour option so picking a colour swaps the shot */
  colour?: string;
};

/** Top-level shop taxonomy, matching the three ranges in the client brief. */
export const CATEGORIES = ["Boxing Gloves", "Apparel", "Equipment & Accessories"] as const;
export type Category = (typeof CATEGORIES)[number];

export type Product = {
  slug: string;
  name: string;
  subtitle: string;
  category: Category;
  collection: string;
  tags: string[];
  basePrice: number;
  baseSalePrice?: number;
  rating: number;
  reviewCount: number;
  badges: string[];
  shortDescription: string;
  description: string[];
  features: string[];
  specs: [string, string][];
  attributes: AttributeDef[];
  variations: Variation[];
  images: ProductImage[];
  personalisation?: {
    label: string;
    price: number;
    maxLength: number;
    hint: string;
  };
  /**
   * Set on ranges the client has not photographed yet. Surfaced under the
   * gallery so nobody mistakes the vector stand-in for final photography.
   */
  artworkNote?: string;
  relatedSlugs: string[];
};

/* ------------------------------------------------------------------ *
 * Shared attribute vocabulary (the "global attributes" in Woo terms)  *
 * ------------------------------------------------------------------ */

const WEIGHTS: AttributeOption[] = [
  { slug: "8oz", label: "8 oz", note: "Pro bouts" },
  { slug: "10oz", label: "10 oz", note: "Pro bouts" },
  { slug: "12oz", label: "12 oz", note: "Sparring" },
  { slug: "14oz", label: "14 oz", note: "Sparring" },
  { slug: "16oz", label: "16 oz", note: "Heavy sparring" },
];

const CLOSURES: AttributeOption[] = [
  { slug: "lace-up", label: "Lace-Up", note: "Fight standard" },
  { slug: "velcro", label: "Hook & Loop", note: "Train solo" },
];

const MITT_SIZES: AttributeOption[] = [
  { slug: "s", label: "S" },
  { slug: "m", label: "M" },
  { slug: "l", label: "L" },
  { slug: "xl", label: "XL" },
];

/* ------------------------------------------------------------------ *
 * Variation generation                                                *
 * ------------------------------------------------------------------ */

/** Deterministic pseudo-random in [0,1). Keeps server and client renders identical. */
function hashUnit(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

function cartesian(groups: { slug: string; options: AttributeOption[] }[]): Record<string, string>[] {
  return groups.reduce<Record<string, string>[]>(
    (acc, group) =>
      acc.flatMap((combo) => group.options.map((opt) => ({ ...combo, [group.slug]: opt.slug }))),
    [{}],
  );
}

type VariationRule = {
  /** per-attribute-option surcharge, e.g. { "16oz": 10 } */
  surcharge?: Record<string, number>;
  /** combinations the client does not stock, as `attr:option` fragments */
  outOfStock?: string[][];
  /** combinations that do not exist at all */
  unavailable?: string[][];
};

function matches(attrs: Record<string, string>, fragment: string[]): boolean {
  return fragment.every((part) => {
    const [key, value] = part.split(":");
    return attrs[key] === value;
  });
}

function buildVariations(
  skuPrefix: string,
  attributes: AttributeDef[],
  basePrice: number,
  baseSalePrice: number | undefined,
  imageFor: (attrs: Record<string, string>) => string,
  rule: VariationRule = {},
): Variation[] {
  const combos = cartesian(attributes.map((a) => ({ slug: a.slug, options: a.options })));

  return combos
    .filter((attrs) => !(rule.unavailable ?? []).some((frag) => matches(attrs, frag)))
    .map((attrs) => {
      const key = Object.values(attrs).join("-");
      const surcharge = Object.values(attrs).reduce(
        (sum, opt) => sum + (rule.surcharge?.[opt] ?? 0),
        0,
      );
      const forcedOut = (rule.outOfStock ?? []).some((frag) => matches(attrs, frag));
      const roll = hashUnit(`${skuPrefix}-${key}`);

      return {
        id: `${skuPrefix}-${key}`,
        sku: `${skuPrefix}-${key.toUpperCase()}`,
        attrs,
        price: basePrice + surcharge,
        salePrice: baseSalePrice === undefined ? undefined : baseSalePrice + surcharge,
        // A handful of sizes read as low or sold out so the picker shows the
        // states a real Woo store would.
        stock: forcedOut ? 0 : roll < 0.08 ? 0 : roll < 0.2 ? Math.ceil(roll * 12) : 20 + Math.round(roll * 40),
        image: imageFor(attrs),
      };
    });
}

/* ------------------------------------------------------------------ *
 * Products                                                            *
 * ------------------------------------------------------------------ */

const PRO_ELITE_COLOURS: AttributeOption[] = [
  {
    slug: "red-white",
    label: "Crimson / White",
    hex: "#C0272D",
    accent: "#F2F2F0",
    image: "/images/products/pro-elite-hh-red.png",
  },
  {
    slug: "blue-gold",
    label: "Royal / Gold",
    hex: "#1B4FA8",
    accent: "#E9B01F",
    image: "/images/products/pro-elite-hh-blue.png",
  },
  {
    slug: "white-gold",
    label: "Bone / Gold",
    hex: "#F6F3EA",
    accent: "#C9A227",
    image: "/images/products/pro-elite-hh-white-gold.png",
  },
  {
    slug: "white-black",
    label: "Bone / Black",
    hex: "#F4F4F4",
    accent: "#17171A",
    image: "/images/products/pro-elite-hh-white.png",
  },
];

const proEliteAttributes: AttributeDef[] = [
  { slug: "colour", name: "Colourway", kind: "swatch", options: PRO_ELITE_COLOURS },
  { slug: "weight", name: "Weight", kind: "pill", options: WEIGHTS, defaultOption: "14oz" },
];

const proElite: Product = {
  slug: "glover-pro-elite-hh",
  name: "GLOVER Pro Elite HH",
  subtitle: "Horsehair pro fight glove",
  category: "Boxing Gloves",
  collection: "Pro Fight",
  tags: ["boxing gloves", "horsehair", "lace-up", "professional"],
  basePrice: 160,
  rating: 4.9,
  reviewCount: 68,
  badges: ["Best seller"],
  shortDescription: "Full-grain leather, authentic horsehair padding, traditional lace-up closure.",
  description: [
    "Engineered for professionals who demand precision, power, and authenticity — the Glover Sports Horsehair Pro Fight Gloves are crafted for the purest expression of combat. Built with premium full-grain leather and traditional horsehair padding, these gloves deliver the unmistakable feedback and punch feel favoured by world-class fighters.",
    "Every detail reflects championship craftsmanship, from the hand-stitched seams to the anatomically contoured fit that moulds perfectly to your fists. The horsehair blend offers a naturally firm yet responsive feel, allowing sharper connection and fight-tested performance.",
    "Emblazoned with the Glover Crown logo, these gloves represent discipline, legacy, and the relentless pursuit of greatness.",
  ],
  features: [
    "Premium full-grain cowhide leather",
    "Authentic horsehair padding blend for professional competition",
    "Traditional lace-up closure for superior wrist control",
    "Compact fight profile for maximum power transfer",
    "Designed to meet professional fight standards",
  ],
  specs: [
    ["Material", "Premium full-grain cowhide leather"],
    ["Padding", "Authentic horsehair blend"],
    ["Closure", "Traditional lace-up"],
    ["Profile", "Compact fight profile"],
    ["Lining", "Moisture-wicking satin"],
    ["Made for", "Professional bouts · sparring · pad work"],
  ],
  attributes: proEliteAttributes,
  variations: buildVariations(
    "PEHH",
    proEliteAttributes,
    160,
    undefined,
    (attrs) =>
      PRO_ELITE_COLOURS.find((c) => c.slug === attrs.colour)?.image ??
      "/images/products/pro-elite-hh-red.png",
    {
      surcharge: { "16oz": 10 },
      outOfStock: [["colour:white-black", "weight:8oz"]],
    },
  ),
  images: [
    {
      src: "/images/products/pro-elite-hh-red.png",
      alt: "GLOVER Pro Elite HH lace-up gloves in crimson and white",
      kind: "cutout",
      colour: "red-white",
    },
    {
      src: "/images/products/pro-elite-hh-blue.png",
      alt: "GLOVER Pro Elite HH lace-up gloves in royal blue with gold crown",
      kind: "cutout",
      colour: "blue-gold",
    },
    {
      src: "/images/products/pro-elite-hh-white-gold.png",
      alt: "GLOVER Pro Elite HH lace-up gloves in bone leather with gold crown",
      kind: "cutout",
      colour: "white-gold",
    },
    {
      src: "/images/products/pro-elite-hh-white.png",
      alt: "GLOVER Pro Elite HH lace-up gloves in bone leather with black crown",
      kind: "cutout",
      colour: "white-black",
    },
    {
      src: "/images/products/detail-crown-logo.jpg",
      alt: "Close-up of the embossed Glover crown on black leather",
      kind: "photo",
    },
    {
      src: "/images/lifestyle/fighter-guard.jpg",
      alt: "Fighter holding a high guard in Glover gloves under ring lights",
      kind: "photo",
    },
  ],
  personalisation: {
    label: "Cuff embroidery",
    price: 25,
    maxLength: 12,
    hint: "Up to 12 characters, stitched in gold thread on the wrist cuff. Adds 5–7 days.",
  },
  relatedSlugs: ["glover-pro-elite-hh-gold", "glover-classics", "glover-3000"],
};

const GOLD_COLOURS: AttributeOption[] = [
  {
    slug: "red-gold",
    label: "Crimson / Gold",
    hex: "#C8232C",
    accent: "#C9A227",
    image: "/images/products/pro-elite-hh-gold.png",
  },
];

const goldAttributes: AttributeDef[] = [
  { slug: "colour", name: "Colourway", kind: "swatch", options: GOLD_COLOURS },
  { slug: "weight", name: "Weight", kind: "pill", options: WEIGHTS, defaultOption: "14oz" },
];

const proEliteGold: Product = {
  slug: "glover-pro-elite-hh-gold",
  name: "GLOVER Pro Elite HH GOLD",
  subtitle: "Red with gold crown · horsehair pro glove",
  category: "Boxing Gloves",
  collection: "Pro Fight",
  tags: ["boxing gloves", "horsehair", "lace-up", "limited"],
  basePrice: 100,
  baseSalePrice: 60,
  rating: 5,
  reviewCount: 24,
  badges: ["Sale"],
  shortDescription: "Horsehair and layered-foam hybrid with the signature gold Protect Your Crown™ insignia.",
  description: [
    "Engineered for champions, the Glover Sports Red with Gold Logo Horsehair Pro Glove delivers authentic fight-night performance with precision, balance, and style. Designed for elite competitors, this glove combines a traditional horsehair and layered-foam blend to maximise punch feedback and power transfer — giving you that unmistakable pro-level snap with every shot.",
    "Handcrafted with premium cowhide leather, reinforced stitching, and a sleek red finish accented by our signature gold “Protect Your Crown™” insignia, these gloves are built to perform and made to stand out.",
    "Train, fight, and represent the crown — where tradition meets innovation.",
  ],
  features: [
    "Authentic horsehair + foam hybrid padding for fight-ready impact",
    "Premium full-grain leather for durability and comfort",
    "Sleek red design with gold Glover Sports logo for a bold pro look",
    "Anatomically contoured for superior wrist alignment and fist closure",
    "Ideal for professional bouts, sparring, or advanced pad work",
  ],
  specs: [
    ["Material", "Premium cowhide leather"],
    ["Padding", "Horsehair + layered foam hybrid"],
    ["Closure", "Traditional lace-up"],
    ["Finish", "Gloss crimson with gold crown"],
    ["Lining", "Moisture-wicking satin"],
    ["Made for", "Professional bouts · sparring · pad work"],
  ],
  attributes: goldAttributes,
  variations: buildVariations(
    "PEHHG",
    goldAttributes,
    100,
    60,
    () => "/images/products/pro-elite-hh-gold.png",
    { surcharge: { "16oz": 10 }, outOfStock: [["weight:8oz"]] },
  ),
  images: [
    {
      src: "/images/products/pro-elite-hh-gold.png",
      alt: "GLOVER Pro Elite HH GOLD lace-up gloves in crimson with gold crown",
      kind: "cutout",
      colour: "red-gold",
    },
    {
      src: "/images/products/athlete-red-gold-glove.jpg",
      alt: "Athlete holding the crimson and gold Glover glove",
      kind: "photo",
    },
    {
      src: "/images/lifestyle/fight-night-victory.jpg",
      alt: "Fighter's arm raised in victory wearing Glover gloves",
      kind: "photo",
    },
    {
      src: "/images/lifestyle/pro-fight-jab.jpg",
      alt: "Pro boxer landing a jab in Glover gloves",
      kind: "photo",
    },
  ],
  personalisation: {
    label: "Cuff embroidery",
    price: 25,
    maxLength: 12,
    hint: "Up to 12 characters, stitched in gold thread on the wrist cuff. Adds 5–7 days.",
  },
  relatedSlugs: ["glover-pro-elite-hh", "glover-classics", "glover-3000"],
};

const CLASSIC_COLOURS: AttributeOption[] = [
  {
    slug: "black-gold",
    label: "Onyx / Gold",
    hex: "#17171A",
    accent: "#E9B01F",
    image: "/images/products/classics-black-gold.png",
  },
];

const classicsAttributes: AttributeDef[] = [
  { slug: "colour", name: "Colourway", kind: "swatch", options: CLASSIC_COLOURS },
  { slug: "weight", name: "Weight", kind: "pill", options: WEIGHTS.slice(1), defaultOption: "14oz" },
];

const classics: Product = {
  slug: "glover-classics",
  name: "GLOVER Classics",
  subtitle: "Limited-edition heritage lace-up",
  category: "Boxing Gloves",
  collection: "Pro Fight",
  tags: ["boxing gloves", "limited", "lace-up", "heritage"],
  basePrice: 185,
  rating: 4.8,
  reviewCount: 31,
  badges: ["Limited drop"],
  shortDescription: "A limited-edition drop that redefines quality — top-tier stitching, meticulous pre-export checks.",
  description: [
    "Glover Classics is a limited-edition drop that redefines what a heritage glove can be. Onyx full-grain leather, a bone-white palm and gold crown detailing — restrained where it counts, unmistakable at a distance.",
    "Every pair passes meticulous pre-export checks: seam tension, padding density, lace-channel alignment and logo registration are all signed off before a glove leaves the line.",
    "Built to perform, designed to stand out. Numbered production, restocked once a season.",
  ],
  features: [
    "Numbered limited production run",
    "Onyx full-grain leather with bone palm",
    "Gold foil crown at the cuff and thumb",
    "Layered latex foam over a horsehair core",
    "Meticulous pre-export QC on every pair",
  ],
  specs: [
    ["Material", "Full-grain cowhide, onyx finish"],
    ["Padding", "Horsehair core + layered latex foam"],
    ["Closure", "Traditional lace-up"],
    ["Detailing", "Gold foil crown, contrast bone palm"],
    ["Production", "Numbered limited run"],
    ["Made for", "Fight night · showcase sparring"],
  ],
  attributes: classicsAttributes,
  variations: buildVariations(
    "GCLS",
    classicsAttributes,
    185,
    undefined,
    () => "/images/products/classics-black-gold.png",
    { surcharge: { "16oz": 10 } },
  ),
  images: [
    {
      src: "/images/products/classics-black-gold.png",
      alt: "GLOVER Classics lace-up gloves in onyx leather with gold crown",
      kind: "cutout",
      colour: "black-gold",
    },
    {
      src: "/images/products/gloves-black-chair.jpg",
      alt: "Glover Classics gloves resting on a black director's chair",
      kind: "photo",
    },
    {
      src: "/images/products/detail-crown-logo.jpg",
      alt: "Close-up of the crown logo on onyx leather",
      kind: "photo",
    },
  ],
  personalisation: {
    label: "Cuff embroidery",
    price: 25,
    maxLength: 12,
    hint: "Up to 12 characters, stitched in gold thread on the wrist cuff. Adds 5–7 days.",
  },
  relatedSlugs: ["glover-pro-elite-hh", "glover-3000", "glover-crown-lace-up"],
};

const G3000_COLOURS: AttributeOption[] = [
  {
    slug: "black-gold",
    label: "Onyx / Gold",
    hex: "#17171A",
    accent: "#C9A227",
    image: "/images/products/pro-elite-hh-black.png",
  },
  {
    slug: "white-gold",
    label: "Bone / Gold",
    hex: "#F6F3EA",
    accent: "#C9A227",
    image: "/images/products/pro-elite-hh-white-gold.png",
  },
];

const g3000Attributes: AttributeDef[] = [
  { slug: "colour", name: "Colourway", kind: "swatch", options: G3000_COLOURS },
  { slug: "closure", name: "Closure", kind: "pill", options: CLOSURES, defaultOption: "lace-up" },
  { slug: "weight", name: "Weight", kind: "pill", options: WEIGHTS.slice(1), defaultOption: "14oz" },
];

const g3000: Product = {
  slug: "glover-3000",
  name: "GLOVER 3000",
  subtitle: "Everyday training glove",
  category: "Boxing Gloves",
  collection: "Training",
  tags: ["boxing gloves", "training", "everyday"],
  basePrice: 160,
  rating: 4.7,
  reviewCount: 52,
  badges: [],
  shortDescription: "The glove you reach for six days a week. Durable build, forgiving padding, honest price.",
  description: [
    "The GLOVER 3000 is the workhorse of the range — the glove you reach for six days a week. Multi-layer latex foam absorbs the volume of bag rounds and pad work without going flat by week three.",
    "Choose the traditional lace-up for the fight-day feel, or hook & loop when you are training solo and need to strap in fast. Same shell, same padding stack, same crown.",
    "Built to perform, designed to stand out, made for those who refuse to settle.",
  ],
  features: [
    "Multi-layer latex foam padding tuned for volume work",
    "Full-grain leather shell with reinforced stitching",
    "Choice of lace-up or hook & loop closure",
    "Mesh palm vents to move heat and moisture",
    "Anatomically contoured grip bar",
  ],
  specs: [
    ["Material", "Full-grain cowhide leather"],
    ["Padding", "Multi-layer latex foam"],
    ["Closure", "Lace-up or hook & loop"],
    ["Ventilation", "Mesh palm panel"],
    ["Lining", "Moisture-wicking satin"],
    ["Made for", "Bag work · pad work · daily training"],
  ],
  attributes: g3000Attributes,
  variations: buildVariations(
    "G3K",
    g3000Attributes,
    160,
    undefined,
    (attrs) =>
      G3000_COLOURS.find((c) => c.slug === attrs.colour)?.image ??
      "/images/products/pro-elite-hh-black.png",
    { surcharge: { "16oz": 10, velcro: -10 } },
  ),
  images: [
    {
      src: "/images/products/pro-elite-hh-black.png",
      alt: "GLOVER 3000 training gloves in onyx leather with gold trim",
      kind: "cutout",
      colour: "black-gold",
    },
    {
      src: "/images/products/pro-elite-hh-white-gold.png",
      alt: "GLOVER 3000 training gloves in bone leather with gold crown",
      kind: "cutout",
      colour: "white-gold",
    },
    {
      src: "/images/products/gloves-white-gold-chair.jpg",
      alt: "Bone and gold Glover glove resting on a director's chair",
      kind: "photo",
    },
    {
      src: "/images/lifestyle/gym-pad-work.jpg",
      alt: "Boxer working the pads with a coach in Glover gloves",
      kind: "photo",
    },
  ],
  personalisation: {
    label: "Cuff embroidery",
    price: 25,
    maxLength: 12,
    hint: "Up to 12 characters, stitched in gold thread on the wrist cuff. Adds 5–7 days.",
  },
  relatedSlugs: ["glover-pro-elite-hh", "glover-crown-lace-up", "crown-bag-mitts"],
};

const CROWN_COLOURS: AttributeOption[] = [
  {
    slug: "white-black",
    label: "Bone / Black",
    hex: "#F4F4F4",
    accent: "#17171A",
    image: "/images/products/pro-elite-hh-white.png",
  },
];

const crownAttributes: AttributeDef[] = [
  { slug: "colour", name: "Colourway", kind: "swatch", options: CROWN_COLOURS },
  { slug: "weight", name: "Weight", kind: "pill", options: WEIGHTS.slice(1), defaultOption: "14oz" },
];

const crownLaceUp: Product = {
  slug: "glover-crown-lace-up",
  name: "GLOVER Crown Lace-Up",
  subtitle: "Clean bone leather, black crown",
  category: "Boxing Gloves",
  collection: "Training",
  tags: ["boxing gloves", "training", "lace-up"],
  basePrice: 150,
  rating: 4.8,
  reviewCount: 19,
  badges: ["New"],
  shortDescription: "Stripped-back bone leather with a matte black crown. Lace-up discipline, everyday price.",
  description: [
    "No gold, no gloss — just bone full-grain leather, a matte black crown and a lace channel that pulls straight. The Crown Lace-Up is for fighters who want the fight-day wrist lock in a glove they can bring to every session.",
    "The padding stack sits between the 3000 and the Pro Elite: firm enough to teach you to land clean, forgiving enough for long rounds on the bag.",
  ],
  features: [
    "Bone full-grain leather with matte black crown",
    "Traditional lace-up closure for a locked wrist",
    "Balanced foam stack for bag and sparring work",
    "Reinforced thumb attachment",
    "Hand-stitched seams throughout",
  ],
  specs: [
    ["Material", "Full-grain cowhide, bone finish"],
    ["Padding", "Balanced multi-density foam"],
    ["Closure", "Traditional lace-up"],
    ["Detailing", "Matte black crown, black lace"],
    ["Lining", "Moisture-wicking satin"],
    ["Made for", "Sparring · bag work · pad work"],
  ],
  attributes: crownAttributes,
  variations: buildVariations(
    "GCLU",
    crownAttributes,
    150,
    undefined,
    () => "/images/products/pro-elite-hh-white.png",
    { surcharge: { "16oz": 10 } },
  ),
  images: [
    {
      src: "/images/products/pro-elite-hh-white.png",
      alt: "GLOVER Crown Lace-Up gloves in bone leather with black crown",
      kind: "cutout",
      colour: "white-black",
    },
    {
      src: "/images/lifestyle/gym-two-fighters.jpg",
      alt: "Two fighters in a Glover-equipped gym ring",
      kind: "photo",
    },
    {
      src: "/images/products/detail-crown-logo.jpg",
      alt: "Close-up of the Glover crown logo on leather",
      kind: "photo",
    },
  ],
  relatedSlugs: ["glover-3000", "glover-classics", "glover-pro-elite-hh"],
};

const MITT_COLOURS: AttributeOption[] = [
  {
    slug: "black-orange",
    label: "Onyx / Flame",
    hex: "#17171A",
    accent: "#E2521F",
    image: "/images/products/bag-mitts-black.png",
  },
];

const mittAttributes: AttributeDef[] = [
  { slug: "colour", name: "Colourway", kind: "swatch", options: MITT_COLOURS },
  { slug: "size", name: "Size", kind: "pill", options: MITT_SIZES, defaultOption: "m" },
];

const bagMitts: Product = {
  slug: "crown-bag-mitts",
  name: "Crown Bag Mitts",
  subtitle: "Leather bag gloves",
  category: "Boxing Gloves",
  collection: "Bag Work",
  tags: ["bag gloves", "mitts", "training"],
  basePrice: 75,
  rating: 4.6,
  reviewCount: 14,
  badges: [],
  shortDescription: "Low-profile leather bag mitts with a flame-orange palm. Built for rounds, not rounds of applause.",
  description: [
    "Slip-on leather bag mitts cut close to the hand, with a flame-orange palm and a compressed foam knuckle plate. Made for the part of training nobody films.",
    "Wide elastic cuff, no strap to fuss with — in, wrapped, working.",
  ],
  features: [
    "Full-grain leather shell, flame-orange palm",
    "Compressed foam knuckle plate",
    "Wide elastic slip-on cuff",
    "Reinforced palm bar",
    "Sized S to XL",
  ],
  specs: [
    ["Material", "Full-grain cowhide leather"],
    ["Padding", "Compressed foam knuckle plate"],
    ["Closure", "Elastic slip-on cuff"],
    ["Detailing", "Flame-orange palm, white crown"],
    ["Made for", "Heavy bag · speed bag · conditioning"],
  ],
  attributes: mittAttributes,
  variations: buildVariations(
    "CBM",
    mittAttributes,
    75,
    undefined,
    () => "/images/products/bag-mitts-black.png",
    { outOfStock: [["size:xl"]] },
  ),
  images: [
    {
      src: "/images/products/bag-mitts-black.png",
      alt: "Crown Bag Mitts in onyx leather with flame-orange palm",
      kind: "cutout",
      colour: "black-orange",
    },
    {
      src: "/images/products/detail-crown-logo.jpg",
      alt: "Close-up of the Glover crown on black leather",
      kind: "photo",
    },
    {
      src: "/images/lifestyle/ring-canvas-gear.jpg",
      alt: "Gloves and pads laid out on red ring canvas",
      kind: "photo",
    },
  ],
  relatedSlugs: ["glover-3000", "glover-crown-lace-up", "glover-pro-elite-hh"],
};

/* ------------------------------------------------------------------ *
 * Apparel & equipment                                                 *
 *                                                                     *
 * The client has not shot these ranges yet, so the imagery is         *
 * technical-flat vector art generated from the brand palette          *
 * (scripts/make-product-art.mjs). Every entry carries `artworkNote`   *
 * so the placeholder is declared on the page rather than implied.     *
 * ------------------------------------------------------------------ */

const ARTWORK_NOTE =
  "Design preview — studio photography for this range is still in production.";

const APPAREL_SIZES: AttributeOption[] = [
  { slug: "xs", label: "XS" },
  { slug: "s", label: "S" },
  { slug: "m", label: "M" },
  { slug: "l", label: "L" },
  { slug: "xl", label: "XL" },
  { slug: "xxl", label: "XXL" },
];

const HEAD_SIZES: AttributeOption[] = [
  { slug: "s", label: "S", note: "54–56 cm" },
  { slug: "m", label: "M", note: "56–58 cm" },
  { slug: "l", label: "L", note: "58–61 cm" },
];

const ONE_SIZE: AttributeOption[] = [{ slug: "one", label: "One size" }];

const TEE_COLOURS: AttributeOption[] = [
  { slug: "onyx", label: "Onyx", hex: "#17171A", image: "/images/products/apparel-crown-tee-onyx.png" },
  { slug: "bone", label: "Bone", hex: "#EFE9D8", image: "/images/products/apparel-crown-tee-bone.png" },
  { slug: "crimson", label: "Crimson", hex: "#C0272D", image: "/images/products/apparel-crown-tee-crimson.png" },
];

const teeAttributes: AttributeDef[] = [
  { slug: "colour", name: "Colour", kind: "swatch", options: TEE_COLOURS },
  { slug: "size", name: "Size", kind: "pill", options: APPAREL_SIZES, defaultOption: "m" },
];

const crownTee: Product = {
  slug: "protect-your-crown-tee",
  name: "Protect Your Crown Tee",
  subtitle: "Heavyweight cotton training tee",
  category: "Apparel",
  collection: "Everyday",
  tags: ["apparel", "tee", "cotton"],
  basePrice: 38,
  rating: 4.7,
  reviewCount: 41,
  badges: [],
  shortDescription: "220 gsm heavyweight cotton with the Glover crown across the chest.",
  description: [
    "The tee you train in and the tee you travel in. Heavyweight 220 gsm ring-spun cotton, pre-shrunk, with a boxy fight-camp cut that stays put when your hands go up.",
    "Crown printed at the chest, woven label at the hem. No slogans, no noise.",
  ],
  features: [
    "220 gsm ring-spun cotton, pre-shrunk",
    "Boxy fight-camp cut with dropped shoulder",
    "Ribbed crew neck with taped shoulders",
    "Screen-printed crown at the chest",
    "Woven Glover label at the hem",
  ],
  specs: [
    ["Material", "100% ring-spun cotton, 220 gsm"],
    ["Fit", "Boxy, true to size"],
    ["Neck", "Ribbed crew with shoulder tape"],
    ["Print", "Water-based screen print"],
    ["Care", "Cold wash, hang dry"],
  ],
  attributes: teeAttributes,
  variations: buildVariations(
    "TEE",
    teeAttributes,
    38,
    undefined,
    (attrs) =>
      TEE_COLOURS.find((c) => c.slug === attrs.colour)?.image ??
      "/images/products/apparel-crown-tee-onyx.png",
    { outOfStock: [["colour:crimson", "size:xxl"]] },
  ),
  images: [
    { src: "/images/products/apparel-crown-tee-onyx.png", alt: "Protect Your Crown tee in onyx", kind: "cutout", colour: "onyx" },
    { src: "/images/products/apparel-crown-tee-bone.png", alt: "Protect Your Crown tee in bone", kind: "cutout", colour: "bone" },
    { src: "/images/products/apparel-crown-tee-crimson.png", alt: "Protect Your Crown tee in crimson", kind: "cutout", colour: "crimson" },
    { src: "/images/lifestyle/gym-two-fighters.jpg", alt: "Fighters in the Glover gym", kind: "photo" },
  ],
  artworkNote: ARTWORK_NOTE,
  relatedSlugs: ["glover-fighter-hoodie", "glover-fight-shorts", "pro-hand-wraps"],
};

const HOODIE_COLOURS: AttributeOption[] = [
  { slug: "onyx", label: "Onyx", hex: "#17171A", image: "/images/products/apparel-hoodie-onyx.png" },
  { slug: "bone", label: "Bone", hex: "#EFE9D8", image: "/images/products/apparel-hoodie-bone.png" },
];

const hoodieAttributes: AttributeDef[] = [
  { slug: "colour", name: "Colour", kind: "swatch", options: HOODIE_COLOURS },
  { slug: "size", name: "Size", kind: "pill", options: APPAREL_SIZES.slice(1), defaultOption: "m" },
];

const fighterHoodie: Product = {
  slug: "glover-fighter-hoodie",
  name: "Glover Fighter Hoodie",
  subtitle: "Heavyweight fleece hoodie",
  category: "Apparel",
  collection: "Everyday",
  tags: ["apparel", "hoodie", "fleece"],
  basePrice: 72,
  rating: 4.9,
  reviewCount: 27,
  badges: ["New"],
  shortDescription: "400 gsm brushed-back fleece, built for warm-ups and the walk home.",
  description: [
    "400 gsm brushed-back fleece with a double-layer hood, flat drawcords and a kangaroo pocket deep enough for wraps. Cut long in the body so it stays down when you do.",
    "Ribbed cuffs and hem hold their shape through the season, not the first wash.",
  ],
  features: [
    "400 gsm brushed-back cotton-blend fleece",
    "Double-layer hood with flat drawcords",
    "Deep kangaroo pocket",
    "Ribbed cuffs and hem",
    "Embroidered crown at the chest",
  ],
  specs: [
    ["Material", "80% cotton / 20% polyester, 400 gsm"],
    ["Fit", "Relaxed, long body"],
    ["Hood", "Double-layer with flat cords"],
    ["Detail", "Embroidered crown"],
    ["Care", "Cold wash, hang dry"],
  ],
  attributes: hoodieAttributes,
  variations: buildVariations(
    "HDE",
    hoodieAttributes,
    72,
    undefined,
    (attrs) =>
      HOODIE_COLOURS.find((c) => c.slug === attrs.colour)?.image ??
      "/images/products/apparel-hoodie-onyx.png",
  ),
  images: [
    { src: "/images/products/apparel-hoodie-onyx.png", alt: "Glover Fighter Hoodie in onyx", kind: "cutout", colour: "onyx" },
    { src: "/images/products/apparel-hoodie-bone.png", alt: "Glover Fighter Hoodie in bone", kind: "cutout", colour: "bone" },
    { src: "/images/lifestyle/coach-lacing-up.jpg", alt: "Coach lacing up before a session", kind: "photo" },
  ],
  artworkNote: ARTWORK_NOTE,
  relatedSlugs: ["protect-your-crown-tee", "glover-fight-shorts", "glover-gym-bag"],
};

const SHORTS_COLOURS: AttributeOption[] = [
  { slug: "crimson", label: "Crimson / Gold", hex: "#C0272D", accent: "#C9A227", image: "/images/products/apparel-shorts-crimson.png" },
  { slug: "onyx", label: "Onyx / Gold", hex: "#17171A", accent: "#C9A227", image: "/images/products/apparel-shorts-onyx.png" },
];

const shortsAttributes: AttributeDef[] = [
  { slug: "colour", name: "Colourway", kind: "swatch", options: SHORTS_COLOURS },
  { slug: "size", name: "Size", kind: "pill", options: APPAREL_SIZES.slice(1, 5), defaultOption: "m" },
];

const fightShorts: Product = {
  slug: "glover-fight-shorts",
  name: "Glover Fight Shorts",
  subtitle: "Satin competition trunks",
  category: "Apparel",
  collection: "Fight Night",
  tags: ["apparel", "shorts", "competition"],
  basePrice: 54,
  rating: 4.8,
  reviewCount: 18,
  badges: [],
  shortDescription: "Satin competition trunks with a wide elastic waistband and full side vents.",
  description: [
    "Competition-cut satin trunks with a 100 mm elastic waistband, full side vents and a hem that clears the knee — nothing catching when you turn on a shot.",
    "Embroidered crown at the waistband, satin panel piping down the leg.",
  ],
  features: [
    "Lightweight satin shell with mesh lining",
    "100 mm elastic waistband with internal drawcord",
    "Full side vents for hip rotation",
    "Embroidered crown at the waistband",
    "Competition-legal cut",
  ],
  specs: [
    ["Material", "Polyester satin, mesh lined"],
    ["Waistband", "100 mm elastic with drawcord"],
    ["Vents", "Full-length side vents"],
    ["Detail", "Embroidered crown, contrast piping"],
    ["Care", "Cold wash, hang dry"],
  ],
  attributes: shortsAttributes,
  variations: buildVariations(
    "SHT",
    shortsAttributes,
    54,
    undefined,
    (attrs) =>
      SHORTS_COLOURS.find((c) => c.slug === attrs.colour)?.image ??
      "/images/products/apparel-shorts-crimson.png",
  ),
  images: [
    { src: "/images/products/apparel-shorts-crimson.png", alt: "Glover fight shorts in crimson and gold", kind: "cutout", colour: "crimson" },
    { src: "/images/products/apparel-shorts-onyx.png", alt: "Glover fight shorts in onyx and gold", kind: "cutout", colour: "onyx" },
    { src: "/images/lifestyle/fight-night-victory.jpg", alt: "Fight night in Glover kit", kind: "photo" },
  ],
  artworkNote: ARTWORK_NOTE,
  relatedSlugs: ["protect-your-crown-tee", "glover-fighter-hoodie", "glover-pro-elite-hh"],
};

const WRAP_COLOURS: AttributeOption[] = [
  { slug: "crimson", label: "Crimson", hex: "#C0272D", image: "/images/products/equip-hand-wraps-crimson.png" },
  { slug: "onyx", label: "Onyx", hex: "#17171A", image: "/images/products/equip-hand-wraps-onyx.png" },
  { slug: "bone", label: "Bone", hex: "#EFE9D8", image: "/images/products/equip-hand-wraps-bone.png" },
];

const wrapAttributes: AttributeDef[] = [
  { slug: "colour", name: "Colour", kind: "swatch", options: WRAP_COLOURS },
  { slug: "size", name: "Length", kind: "pill", options: ONE_SIZE, defaultOption: "one" },
];

const handWraps: Product = {
  slug: "pro-hand-wraps",
  name: "Pro Hand Wraps",
  subtitle: "180″ semi-elastic wraps",
  category: "Equipment & Accessories",
  collection: "Essentials",
  tags: ["equipment", "wraps", "essentials"],
  basePrice: 18,
  rating: 4.6,
  reviewCount: 96,
  badges: [],
  shortDescription: "180-inch semi-elastic cotton wraps with a wide thumb loop and full-width hook closure.",
  description: [
    "180 inches of semi-elastic cotton — long enough to wrap knuckles, wrist and thumb properly without running out halfway through the third pass.",
    "Wide thumb loop that does not roll, and a full-width hook closure that holds through a full session.",
  ],
  features: [
    "180″ (457 cm) semi-elastic cotton",
    "Wide thumb loop that resists rolling",
    "Full-width hook-and-loop closure",
    "Breathable weave",
    "Sold as a pair",
  ],
  specs: [
    ["Length", "180″ / 457 cm"],
    ["Material", "Semi-elastic cotton blend"],
    ["Closure", "Full-width hook and loop"],
    ["Sold as", "Pair"],
    ["Care", "Machine wash cold in a mesh bag"],
  ],
  attributes: wrapAttributes,
  variations: buildVariations(
    "WRP",
    wrapAttributes,
    18,
    undefined,
    (attrs) =>
      WRAP_COLOURS.find((c) => c.slug === attrs.colour)?.image ??
      "/images/products/equip-hand-wraps-crimson.png",
  ),
  images: [
    { src: "/images/products/equip-hand-wraps-crimson.png", alt: "Pro hand wraps in crimson", kind: "cutout", colour: "crimson" },
    { src: "/images/products/equip-hand-wraps-onyx.png", alt: "Pro hand wraps in onyx", kind: "cutout", colour: "onyx" },
    { src: "/images/products/equip-hand-wraps-bone.png", alt: "Pro hand wraps in bone", kind: "cutout", colour: "bone" },
    { src: "/images/lifestyle/ring-canvas-gear.jpg", alt: "Wraps and gear on the ring canvas", kind: "photo" },
  ],
  artworkNote: ARTWORK_NOTE,
  relatedSlugs: ["crown-headgear", "glover-gym-bag", "glover-3000"],
};

const HEADGEAR_COLOURS: AttributeOption[] = [
  { slug: "onyx", label: "Onyx / Gold", hex: "#17171A", accent: "#C9A227", image: "/images/products/equip-headgear-onyx.png" },
  { slug: "crimson", label: "Crimson", hex: "#C0272D", image: "/images/products/equip-headgear-crimson.png" },
];

const headgearAttributes: AttributeDef[] = [
  { slug: "colour", name: "Colourway", kind: "swatch", options: HEADGEAR_COLOURS },
  { slug: "size", name: "Size", kind: "pill", options: HEAD_SIZES, defaultOption: "m" },
];

const headgear: Product = {
  slug: "crown-headgear",
  name: "Crown Headgear",
  subtitle: "Full-face sparring headgear",
  category: "Equipment & Accessories",
  collection: "Protection",
  tags: ["equipment", "headgear", "protection"],
  basePrice: 95,
  rating: 4.8,
  reviewCount: 22,
  badges: [],
  shortDescription: "Full-grain leather sparring headgear with layered cheek protection and an open sightline.",
  description: [
    "Full-grain leather shell over layered foam, with deep cheek and temple protection that still leaves a clean sightline for the shot you need to see coming.",
    "Adjustable crown lace and rear closure lock the fit so it stays where you put it, round after round.",
  ],
  features: [
    "Full-grain leather shell",
    "Layered foam cheek and temple protection",
    "Wide sightline aperture",
    "Adjustable crown lace and rear closure",
    "Moisture-wicking inner lining",
  ],
  specs: [
    ["Material", "Full-grain cowhide leather"],
    ["Padding", "Layered high-density foam"],
    ["Closure", "Crown lace + rear hook and loop"],
    ["Coverage", "Cheek, temple, rear"],
    ["Made for", "Sparring"],
  ],
  attributes: headgearAttributes,
  variations: buildVariations(
    "HDG",
    headgearAttributes,
    95,
    undefined,
    (attrs) =>
      HEADGEAR_COLOURS.find((c) => c.slug === attrs.colour)?.image ??
      "/images/products/equip-headgear-onyx.png",
    { outOfStock: [["colour:crimson", "size:l"]] },
  ),
  images: [
    { src: "/images/products/equip-headgear-onyx.png", alt: "Crown headgear in onyx and gold", kind: "cutout", colour: "onyx" },
    { src: "/images/products/equip-headgear-crimson.png", alt: "Crown headgear in crimson", kind: "cutout", colour: "crimson" },
    { src: "/images/lifestyle/amateur-bout.jpg", alt: "Sparring in headgear", kind: "photo" },
  ],
  artworkNote: ARTWORK_NOTE,
  relatedSlugs: ["pro-hand-wraps", "glover-3000", "glover-gym-bag"],
};

const BAG_COLOURS: AttributeOption[] = [
  { slug: "onyx", label: "Onyx", hex: "#17171A", accent: "#C9A227", image: "/images/products/equip-gym-bag-onyx.png" },
];

const bagAttributes: AttributeDef[] = [
  { slug: "colour", name: "Colour", kind: "swatch", options: BAG_COLOURS },
  { slug: "size", name: "Size", kind: "pill", options: ONE_SIZE, defaultOption: "one" },
];

const gymBag: Product = {
  slug: "glover-gym-bag",
  name: "Glover Gym Bag",
  subtitle: "45 L vented kit bag",
  category: "Equipment & Accessories",
  collection: "Essentials",
  tags: ["equipment", "bag", "essentials"],
  basePrice: 65,
  rating: 4.7,
  reviewCount: 33,
  badges: [],
  shortDescription: "45-litre kit bag with a vented glove compartment and a reinforced base.",
  description: [
    "A 45-litre duffel sized for a full kit: gloves, wraps, shoes, and the shorts you forgot to take out last week. The vented end compartment keeps damp gloves away from everything else.",
    "Reinforced base, taped seams and a padded shoulder strap that survives the walk from the car.",
  ],
  features: [
    "45 L main compartment",
    "Vented end compartment for gloves",
    "Reinforced, water-resistant base",
    "Padded detachable shoulder strap",
    "Woven crown badge",
  ],
  specs: [
    ["Capacity", "45 litres"],
    ["Material", "600D coated polyester"],
    ["Ventilation", "Mesh end compartment"],
    ["Base", "Reinforced, water-resistant"],
    ["Strap", "Padded, detachable"],
  ],
  attributes: bagAttributes,
  variations: buildVariations(
    "BAG",
    bagAttributes,
    65,
    undefined,
    () => "/images/products/equip-gym-bag-onyx.png",
  ),
  images: [
    { src: "/images/products/equip-gym-bag-onyx.png", alt: "Glover gym bag in onyx", kind: "cutout", colour: "onyx" },
    { src: "/images/lifestyle/gym-pad-work.jpg", alt: "Training session in the Glover gym", kind: "photo" },
  ],
  artworkNote: ARTWORK_NOTE,
  relatedSlugs: ["pro-hand-wraps", "crown-headgear", "protect-your-crown-tee"],
};

export const products: Product[] = [
  proElite,
  proEliteGold,
  classics,
  g3000,
  crownLaceUp,
  bagMitts,
  crownTee,
  fighterHoodie,
  fightShorts,
  handWraps,
  headgear,
  gymBag,
];

export const collections = [
  "Pro Fight",
  "Training",
  "Bag Work",
  "Everyday",
  "Fight Night",
  "Essentials",
  "Protection",
] as const;

/** Categories in brief order, with the products that sit under each. */
export function byCategory(): { category: Category; products: Product[] }[] {
  return CATEGORIES.map((category) => ({
    category,
    products: products.filter((p) => p.category === category),
  }));
}

/* ------------------------------------------------------------------ *
 * Lookups & derived data                                              *
 * ------------------------------------------------------------------ */

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function priceRange(product: Product): { min: number; max: number } {
  const prices = product.variations.map((v) => v.salePrice ?? v.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export function listPrice(product: Product): { now: number; was?: number } {
  const { min } = priceRange(product);
  if (product.baseSalePrice === undefined) return { now: min };
  return { now: min, was: product.basePrice };
}

export function colourOptions(product: Product): AttributeOption[] {
  return product.attributes.find((a) => a.slug === "colour")?.options ?? [];
}

/** All colour slugs used anywhere in the catalogue, for the shop filter rail. */
export function allColours(): AttributeOption[] {
  const seen = new Map<string, AttributeOption>();
  for (const product of products) {
    for (const opt of colourOptions(product)) {
      if (!seen.has(opt.slug)) seen.set(opt.slug, opt);
    }
  }
  return [...seen.values()];
}

/** All weight/size options across the catalogue, ordered small to large. */
export function allSizes(): AttributeOption[] {
  const seen = new Map<string, AttributeOption>();
  for (const product of products) {
    for (const attr of product.attributes) {
      if (attr.slug !== "weight" && attr.slug !== "size") continue;
      for (const opt of attr.options) {
        if (!seen.has(opt.slug)) seen.set(opt.slug, opt);
      }
    }
  }
  const order = ["8oz", "10oz", "12oz", "14oz", "16oz", "xs", "s", "m", "l", "xl", "xxl", "one"];
  return [...seen.values()].sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug));
}

export function inStock(product: Product): boolean {
  return product.variations.some((v) => v.stock > 0);
}

/** Cards show the cut-out shot first and a second frame for the hover swap. */
export function cardImages(product: Product): { main: ProductImage; alt?: ProductImage } {
  const [main, ...rest] = product.images;
  return { main, alt: rest[0] };
}
