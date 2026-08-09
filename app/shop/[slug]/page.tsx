import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import ProductCard from "@/components/ProductCard";
import Stars from "@/components/Stars";
import { getProduct, priceRange, products } from "@/lib/catalog";

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

const pillars = [
  {
    title: "Wrist support",
    copy: "Lace-up closure aligns and protects the wrist through every strike.",
  },
  {
    title: "Horsehair feel",
    copy: "Naturally firm, responsive padding for a sharper connection.",
  },
  {
    title: "Knuckle protection",
    copy: "Layered construction built to professional fight standards.",
  },
];

const reviews = [
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
];

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const related = product.relatedSlugs
    .map(getProduct)
    .filter((p) => p !== undefined)
    .slice(0, 3);

  const range = priceRange(product);

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
          {pillars.map((pillar) => (
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
      <section className="section-dark pad" id="sizing">
        <div className="wrap cols cols-1-12">
          <div>
            <span className="eyebrow bracket">Size guide</span>
            <h2 className="display h3" style={{ margin: ".3em 0 .4em" }}>
              Get the weight right.
            </h2>
            <p className="body-copy" style={{ maxWidth: "42ch" }}>
              Glove weight is about protection, not hand size — heavier gloves carry more padding, so
              they take more punishment out of sparring. Match the weight to what you are doing and
              who you are doing it with.
            </p>
            <p className="body-copy" style={{ maxWidth: "42ch", marginTop: 14 }}>
              Unsure between two? Size up. Nobody ever regretted 16 oz on the bag.
            </p>
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Weight</th>
                  <th>Body weight</th>
                  <th>Hand circumference</th>
                  <th>Best for</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>8 oz</td>
                  <td>Under 60 kg</td>
                  <td>17 – 19 cm</td>
                  <td>Professional bouts</td>
                </tr>
                <tr>
                  <td>10 oz</td>
                  <td>60 – 70 kg</td>
                  <td>18 – 20 cm</td>
                  <td>Bouts, pad work</td>
                </tr>
                <tr>
                  <td>12 oz</td>
                  <td>60 – 75 kg</td>
                  <td>19 – 21 cm</td>
                  <td>Sparring, bag work</td>
                </tr>
                <tr>
                  <td>14 oz</td>
                  <td>70 – 85 kg</td>
                  <td>20 – 22 cm</td>
                  <td>Sparring, daily training</td>
                </tr>
                <tr>
                  <td>16 oz</td>
                  <td>80 kg +</td>
                  <td>21 – 24 cm</td>
                  <td>Heavy sparring, all-round</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ------------------------------- reviews -------------------------------- */}
      <section className="section-dark pad-sm" style={{ borderTop: "1px solid var(--line)" }}>
        <div className="wrap">
          <div className="row-between" style={{ marginBottom: 28 }}>
            <div>
              <span className="eyebrow bracket">Reviews</span>
              <h2 className="display h3" style={{ margin: ".2em 0 8px" }}>
                What fighters say.
              </h2>
              <Stars rating={product.rating} count={product.reviewCount} />
            </div>
          </div>

          <div className="grid-3">
            {reviews.map((review) => (
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
