import Image from "next/image";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import ProductCard from "@/components/ProductCard";
import Tape from "@/components/Tape";
import { byCategory, getProduct } from "@/lib/catalog";
import { site } from "@/lib/site";

const featured = ["glover-pro-elite-hh", "glover-classics", "glover-pro-elite-hh-gold"]
  .map(getProduct)
  .filter((p) => p !== undefined);

const CATEGORY_ART: Record<string, { image: string; alt: string }> = {
  "Boxing Gloves": {
    image: "/images/products/pro-elite-hh-blue.png",
    alt: "Royal blue and gold Glover lace-up gloves",
  },
  Apparel: {
    image: "/images/products/apparel-hoodie-onyx.png",
    alt: "Glover Fighter Hoodie in onyx",
  },
  "Equipment & Accessories": {
    image: "/images/products/equip-headgear-onyx.png",
    alt: "Crown headgear in onyx and gold",
  },
};

const categories = byCategory().map(({ category, products }) => ({
  title: category,
  count: products.length,
  href: `/shop?category=${encodeURIComponent(category)}`,
  ...CATEGORY_ART[category],
}));

const classes = [
  {
    title: "Boxercise",
    copy: "Rounds, ropes and combinations. Conditioning that happens to teach you how to fight.",
    image: "/images/lifestyle/amateur-bout.jpg",
    alt: "Amateur bout in a packed hall",
  },
  {
    title: "Strength",
    copy: "Barbell and bodyweight work built around the demands of the ring, not the mirror.",
    image: "/images/lifestyle/strength-training.jpg",
    alt: "Athlete setting up for a deadlift",
  },
  {
    title: "Cardio",
    copy: "Engine work. The difference between round three and round ten is built here.",
    image: "/images/lifestyle/conditioning.jpg",
    alt: "Athlete training on a gym rig",
  },
];

const gallery = [
  { src: "/images/lifestyle/pro-fight-jab.jpg", alt: "Pro boxer landing a jab in Glover gloves" },
  { src: "/images/lifestyle/fight-night-victory.jpg", alt: "Fighter's hand raised after a win" },
  { src: "/images/lifestyle/gym-pad-work.jpg", alt: "Pad work in the Glover gym" },
  { src: "/images/lifestyle/ring-canvas-gear.jpg", alt: "Gloves and pads on the ring canvas" },
];

export default function HomePage() {
  return (
    <>
      <PageHero
        image="/images/lifestyle/home-hero.jpg"
        imageAlt="Gloves, pads and wraps laid out on the red ring canvas"
        eyebrow="Est. Glover Sports"
        meta="premium fight equipment"
        priority
        title={
          <>
            Glover Sports —<br />
            changing the
            <br />
            fight game.
          </>
        }
      >
        <div className="row">
          <Link className="btn btn-solid" href="/shop">
            Shop the crown
          </Link>
          <Link className="btn btn-ghost" href="/book-training">
            Book training
          </Link>
        </div>
      </PageHero>

      {/* ------------------------------ manifesto ------------------------------ */}
      <section className="section-cream" style={{ borderTop: "1px solid var(--line-dark)" }}>
        <div className="wrap pad-sm cols cols-1-14 cols-center">
          <div>
            <h2 className="display h3 reveal" style={{ margin: "0 0 .4em" }}>
              Manifesto.
            </h2>
            <div
              className="frame"
              style={{ aspectRatio: "4 / 5", position: "relative" }}
            >
              <Image
                src="/images/lifestyle/fighter-guard.jpg"
                alt="Fighter holding a high guard in crimson Glover gloves under ring lights"
                fill
                sizes="(max-width: 980px) 100vw, 40vw"
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>
          <p className="lede">
            Our gloves are built to perform, designed to stand out, and made for those who refuse to
            settle. Crafted with premium materials for durability, comfort, and clean, confident
            style — every pair is engineered to meet you at your level and push you beyond it.
            Trusted by fighters who train with intention and move with purpose. We are not just gear.{" "}
            <strong>We are Glover.</strong>
          </p>
        </div>
      </section>

      <Tape items={["Protect your crown", "No compromise", "Built to perform", "We are Glover"]} />

      {/* --------------------------- featured products --------------------------- */}
      <section className="section-dark pad">
        <div className="wrap">
          <div className="row-between" style={{ marginBottom: 40 }}>
            <div>
              <span className="eyebrow bracket">Featured</span>
              <h2 className="display h2 reveal" style={{ margin: ".2em 0 0" }}>
                The crown
                <br />
                collection.
              </h2>
            </div>
            <Link className="btn btn-ghost" href="/shop">
              Shop all →
            </Link>
          </div>

          <div className="product-grid">
            {featured.map((product, index) => (
              <ProductCard key={product.slug} product={product} priority={index === 0} />
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------ categories ------------------------------- */}
      <section className="section-dark pad-sm" style={{ borderTop: "1px solid var(--line)" }}>
        <div className="wrap">
          <h2 className="display h3 reveal" style={{ margin: "0 0 .5em" }}>
            Shop by category.
          </h2>
          <div className="grid-3">
            {categories.map((item) => (
              <Link className="cat-card reveal" href={item.href} key={item.title}>
                <div className="cat-card-media">
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 860px) 100vw, 33vw"
                    style={{ objectFit: "contain", padding: "12%" }}
                  />
                </div>
                <div className="cat-card-body">
                  <h3 className="display" style={{ fontSize: 24, margin: 0 }}>
                    {item.title}
                  </h3>
                  <span className="eyebrow">{item.count} products →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------- training split ----------------------------- */}
      <section className="section-cream">
        <div className="wrap split" style={{ minHeight: 540 }}>
          <div style={{ position: "relative", minHeight: 420, overflow: "hidden" }}>
            <Image
              src="/images/lifestyle/coach-lacing-up.jpg"
              alt="Coach lacing up a pair of crimson Glover gloves"
              fill
              sizes="(max-width: 860px) 100vw, 55vw"
              style={{ objectFit: "cover" }}
            />
          </div>
          <div className="split-copy">
            <span className="eyebrow on-cream bracket">Train with Glover</span>
            <h2 className="display h2" style={{ margin: ".25em 0 .4em" }}>
              Your first
              <br />
              punch is a<br />
              click away.
            </h2>
            <p className="body-copy" style={{ maxWidth: "44ch", margin: "0 0 28px" }}>
              Schedule your boxing training session with our world-class coaches. A personalised and
              professional experience tailored to enhance your skills and meet your fitness goals.
              You can keep thinking about it — or you can make the move now.
            </p>
            <div className="row">
              <Link className="btn btn-dark" href="/book-training">
                Book now
              </Link>
              <Link className="btn btn-ghost" href="/services">
                See services
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------- founder -------------------------------- */}
      <section className="section-dark pad">
        <div className="wrap cols cols-1-1 cols-center">
          <div>
            <span className="eyebrow bracket">Dreams to reality</span>
            <h2 className="display h2 reveal" style={{ margin: ".3em 0 .4em" }}>
              Founded by a<br />
              fighter, not a<br />
              boardroom.
            </h2>
            <p className="body-copy" style={{ maxWidth: "46ch" }}>
              Glover Sports was founded by <strong>As&rsquo;im Smith</strong>, an innovator with a deep
              love for boxing who saw the gaps in the quality and safety of the gear athletes relied
              on. In 2023 Glover launched its first line of gloves — with a promise that every
              release would surpass the last.
            </p>
            <p className="body-copy" style={{ maxWidth: "46ch", marginTop: 14 }}>
              Not a sea of mass-produced, lower-quality options. Top-tier, innovative gear that
              inspires confidence and safeguards athletes — amateurs and seasoned professionals
              alike.
            </p>
            <Link className="btn btn-ghost" href="/about" style={{ marginTop: 28 }}>
              Read the story
            </Link>
          </div>
          <div className="frame" style={{ aspectRatio: "4 / 5", position: "relative" }}>
            <Image
              src="/images/lifestyle/gym-two-fighters.jpg"
              alt="Two fighters in the ring wearing Glover gloves"
              fill
              sizes="(max-width: 860px) 100vw, 45vw"
              style={{ objectFit: "cover" }}
            />
          </div>
        </div>
      </section>

      {/* ------------------------------- classes -------------------------------- */}
      <section className="section-cream pad">
        <div className="wrap">
          <div className="row-between" style={{ marginBottom: 34 }}>
            <div>
              <span className="eyebrow on-cream bracket">Classes</span>
              <h2 className="display h2 reveal" style={{ margin: ".2em 0 0" }}>
                Train with us.
              </h2>
            </div>
            <Link className="btn btn-ghost" href="/services">
              All services →
            </Link>
          </div>

          <div className="grid-3">
            {classes.map((item, index) => (
              <article className="reveal" key={item.title}>
                <div className="frame" style={{ aspectRatio: "4 / 3", position: "relative" }}>
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 860px) 100vw, 33vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <span className="tag" style={{ color: "var(--ink)", marginTop: 16, display: "inline-flex" }}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="display h3" style={{ margin: ".3em 0 .3em" }}>
                  {item.title}
                </h3>
                <p className="body-copy" style={{ margin: 0 }}>
                  {item.copy}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Tape dark items={["New drop", `Free shipping over $${site.freeShippingFrom}`, "Protect your crown"]} />

      {/* ------------------------------- gallery -------------------------------- */}
      <section className="section-dark pad">
        <div className="wrap">
          <div className="row-between" style={{ marginBottom: 30 }}>
            <h2 className="display h3 reveal" style={{ margin: 0 }}>
              From the gym floor.
            </h2>
            <a
              className="eyebrow bracket"
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
            >
              @weareglover
            </a>
          </div>

          <div className="gallery-4">
            {gallery.map((item) => (
              <div className="gallery-tile frame reveal" key={item.src}>
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 860px) 50vw, 25vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
