import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import ProductCard from "@/components/ProductCard";
import Stars from "@/components/Stars";
import { getProduct, priceRange, products, type Category } from "@/lib/catalog";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Product not found" };

  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: `${product.name} — Glover Boxing`,
      description: product.shortDescription,
      images: [product.images[0].src],
    },
  };
}

/** Support content is category-specific — a tee page should not talk horsehair. */
const PILLARS: Record<Category, { title: string; copy: string }[]> = {
  "Boxing Gloves": [
    { title: "Wrist support", copy: "Lace-up closure aligns and protects the wrist through every strike." },
    { title: "Horsehair feel", copy: "Naturally firm, responsive padding for a sharper connection." },
    { title: "Knuckle protection", copy: "Layered construction built to professional fight standards." },
  ],
  Apparel: [
    { title: "Built to be worn out", copy: "Heavyweight fabric and taped seams that survive the season, not the first wash." },
    { title: "Cut for training", copy: "Room through the shoulder and chest so nothing pulls when your hands go up." },
    { title: "Quiet branding", copy: "The crown, a woven label, and nothing else shouting for attention." },
  ],
  "Equipment & Accessories": [
    { title: "Made for volume", copy: "Materials chosen for the sessions nobody films — round after round after round." },
    { title: "Fits and stays", copy: "Closures that hold where you set them, from the first round to the last." },
    { title: "Pre-export QC", copy: "Every piece hand-checked before it leaves the line." },
  ],
};

const REVIEWS: Record<Category, { name: string; role: string; rating: number; title: string; body: string }[]> = {
  "Boxing Gloves": [
    {
      name: "Marcus D.",
      role: "Amateur, 12–0",
      rating: 5,
      title: "Fight-night feel, straight out of the box",
      body: "Broke them in over two sessions. The lace channel pulls dead straight and the horsehair gives you that flat, honest feedback you only get from a real pro glove.",
    },
    {
      name: "Renée A.",
      role: "Coach, Glover gym",
      rating: 5,
      title: "I put my whole squad in these",
      body: "Stitching has held on eight pairs through a full season of pad work. That is the part nobody markets and the only part I care about.",
    },
    {
      name: "Tom K.",
      role: "Weekend fighter",
      rating: 4,
      title: "Worth the step up",
      body: "Firmer than my old training gloves, which took a week. Now I would not go back — you learn to land clean because you feel everything.",
    },
  ],
  Apparel: [
    {
      name: "Jordan P.",
      role: "Trains five days a week",
      rating: 5,
      title: "Heavier than I expected, in a good way",
      body: "Most gym tees go see-through by month two. This one still holds its shape and the print has not cracked once.",
    },
    {
      name: "Aisha R.",
      role: "Coach",
      rating: 5,
      title: "Fits like it was cut for boxing",
      body: "Room across the back and through the shoulder, so nothing rides up when you put your hands up. Rare in gym kit.",
    },
    {
      name: "Dan M.",
      role: "Weekend fighter",
      rating: 4,
      title: "Sizing runs boxy",
      body: "True to size but cut wide by design. If you want it close to the body, take one down.",
    },
  ],
  "Equipment & Accessories": [
    {
      name: "Sam O.",
      role: "Amateur",
      rating: 5,
      title: "Finally, wraps that are actually long enough",
      body: "180 inches means you can do the wrist properly instead of running out at the thumb. Thumb loop has not rolled once.",
    },
    {
      name: "Priya N.",
      role: "Coach, community gym",
      rating: 5,
      title: "Bought six for the club",
      body: "Six months of shared use and every closure still grips. That is the whole review.",
    },
    {
      name: "Ryan T.",
      role: "Trains three days a week",
      rating: 4,
      title: "Does the job, looks good doing it",
      body: "Nothing flashy, everything where it should be. The crown detail is the only branding and it works.",
    },
  ],
};

const SIZE_GUIDES: Record<Category, { title: string; intro: string[]; head: string[]; rows: string[][] } | null> = {
  "Boxing Gloves": {
    title: "Get the weight right.",
    intro: [
      "Glove weight is about protection, not hand size — heavier gloves carry more padding, so they take more punishment out of sparring. Match the weight to what you are doing and who you are doing it with.",
      "Unsure between two? Size up. Nobody ever regretted 16 oz on the bag.",
    ],
    head: ["Weight", "Body weight", "Hand circumference", "Best for"],
    rows: [
      ["8 oz", "Under 60 kg", "17 – 19 cm", "Professional bouts"],
      ["10 oz", "60 – 70 kg", "18 – 20 cm", "Bouts, pad work"],
      ["12 oz", "60 – 75 kg", "19 – 21 cm", "Sparring, bag work"],
      ["14 oz", "70 – 85 kg", "20 – 22 cm", "Sparring, daily training"],
      ["16 oz", "80 kg +", "21 – 24 cm", "Heavy sparring, all-round"],
    ],
  },
  Apparel: {
    title: "Find your size.",
    intro: [
      "Measurements are of the garment laid flat, in centimetres. Our tops are cut boxy on purpose — room through the shoulder and chest so nothing pulls when your hands go up.",
      "Between two sizes? Take the smaller one for a closer fit, the larger one if you layer.",
    ],
    head: ["Size", "Chest", "Body length", "Sleeve"],
    rows: [
      ["XS", "50 cm", "68 cm", "20 cm"],
      ["S", "53 cm", "70 cm", "21 cm"],
      ["M", "56 cm", "72 cm", "22 cm"],
      ["L", "59 cm", "74 cm", "23 cm"],
      ["XL", "62 cm", "76 cm", "24 cm"],
      ["XXL", "65 cm", "78 cm", "25 cm"],
    ],
  },
  "Equipment & Accessories": {
    title: "Find your fit.",
    intro: [
      "Headgear is sized on head circumference — measure around the widest point, just above the brows and ears.",
      "Wraps and bags are one size. If you are between headgear sizes, size up and take in the crown lace.",
    ],
    head: ["Size", "Head circumference", "Best for"],
    rows: [
      ["S", "54 – 56 cm", "Junior and smaller adult"],
      ["M", "56 – 58 cm", "Most adults"],
      ["L", "58 – 61 cm", "Larger adult"],
      ["One size", "—", "Wraps, bags and accessories"],
    ],
  },
};

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const related = product.relatedSlugs
    .map(getProduct)
    .filter((p) => p !== undefined)
    .slice(0, 3);

  const range = priceRange(product);
  const sizeGuide = SIZE_GUIDES[product.category];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    image: product.images.map((image) => image.src),
    brand: { "@type": "Brand", name: "Glover Sports" },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: range.min,
      highPrice: range.max,
      offerCount: product.variations.length,
      availability: product.variations.some((v) => v.stock > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="section-dark breadcrumb">
        <div className="wrap">
          <span className="eyebrow">
            <Link href="/">Home</Link> / <Link href="/shop">Shop</Link> /{" "}
            <Link href={`/shop?collection=${encodeURIComponent(product.collection)}`}>
              {product.collection}
            </Link>{" "}
            / {product.name}
          </span>
        </div>
      </div>

      <ProductDetail product={product} />

      {/* ------------------------------- pillars -------------------------------- */}
      <section className="section-cream pad-sm">
        <div className="wrap grid-3" style={{ textAlign: "center" }}>
          {PILLARS[product.category].map((pillar) => (
            <div key={pillar.title}>
              <h3 className="display h3">{pillar.title}</h3>
              <p className="body-copy" style={{ margin: ".5em 0 0" }}>
                {pillar.copy}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------- sizing --------------------------------- */}
      {sizeGuide ? (
        <section className="section-dark pad" id="sizing">
          <div className="wrap cols cols-1-12">
            <div>
              <span className="eyebrow bracket">Size guide</span>
              <h2 className="display h3" style={{ margin: ".3em 0 .4em" }}>
                {sizeGuide.title}
              </h2>
              {sizeGuide.intro.map((paragraph, index) => (
                <p
                  className="body-copy"
                  key={paragraph.slice(0, 30)}
                  style={{ maxWidth: "42ch", marginTop: index === 0 ? 0 : 14 }}
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    {sizeGuide.head.map((heading) => (
                      <th key={heading}>{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sizeGuide.rows.map((row) => (
                    <tr key={row[0]}>
                      {row.map((cell) => (
                        <td key={cell}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : null}

      {/* ------------------------------- reviews -------------------------------- */}
      <section className="section-dark pad-sm" style={{ borderTop: "1px solid var(--line)" }}>
        <div className="wrap">
          <div className="row-between" style={{ marginBottom: 28 }}>
            <div>
              <span className="eyebrow bracket">Reviews</span>
              <h2 className="display h3" style={{ margin: ".2em 0 8px" }}>
                {product.category === "Boxing Gloves" ? "What fighters say." : "What people say."}
              </h2>
              <Stars rating={product.rating} count={product.reviewCount} />
            </div>
          </div>

          <div className="grid-3">
            {REVIEWS[product.category].map((review) => (
              <article className="review reveal" key={review.name}>
                <Stars rating={review.rating} />
                <strong style={{ fontFamily: "var(--font-cond)", letterSpacing: ".03em", fontSize: 17 }}>
                  {review.title}
                </strong>
                <p className="body-copy" style={{ margin: 0, fontSize: 14 }}>
                  {review.body}
                </p>
                <span className="eyebrow">
                  {review.name} · {review.role}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------- related -------------------------------- */}
      {related.length > 0 ? (
        <section className="section-dark pad">
          <div className="wrap">
            <div className="row-between" style={{ marginBottom: 28 }}>
              <h2 className="display h3" style={{ margin: 0 }}>
                You may also like.
              </h2>
              <Link className="btn btn-ghost btn-sm" href="/shop">
                Shop all →
              </Link>
            </div>
            <div className="product-grid">
              {related.map((item) => (
                <ProductCard key={item.slug} product={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
