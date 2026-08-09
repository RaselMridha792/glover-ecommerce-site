import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ShopBrowser from "@/components/ShopBrowser";
import Tape from "@/components/Tape";
import { products } from "@/lib/catalog";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Shop Glover boxing gloves, apparel, and equipment. Full-grain leather, authentic horsehair, built to perform and designed to stand out.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ collection?: string; category?: string }>;
}) {
  const { collection, category } = await searchParams;

  return (
    <>
      {/* -------------------------- collection banner -------------------------- */}
      <section className="section-cream" style={{ position: "relative", overflow: "hidden" }}>
        <div
          className="wrap cols cols-11-1 cols-center"
          style={{ paddingTop: 56, paddingBottom: 56 }}
        >
          <div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
              <span className="eyebrow on-cream">
                <Link href="/">Home</Link> / Shop{category ? ` / ${category}` : ""}
              </span>
            </div>
            <h1 className="display h1" style={{ margin: 0 }}>
              The store.
            </h1>
            <p className="body-copy" style={{ maxWidth: "58ch", margin: "18px 0 0" }}>
              Gloves, apparel and equipment — every piece engineered to meet you at your level and
              push you beyond it. Full-grain leather, authentic horsehair blends and meticulous
              pre-export checks on every pair that leaves the line.
            </p>
            <div className="row" style={{ marginTop: 26 }}>
              <span className="tag" style={{ color: "var(--ink)" }}>
                Free shipping over ${site.freeShippingFrom}
              </span>
              <span className="tag" style={{ color: "var(--ink)" }}>
                30-day returns
              </span>
              <span className="tag" style={{ color: "var(--ink)" }}>
                Pre-export QC
              </span>
            </div>
          </div>

          <div
            className="frame"
            style={{ aspectRatio: "5 / 4", position: "relative", background: "var(--cream-3)" }}
          >
            <Image
              src="/images/lifestyle/pro-fight-cross.jpg"
              alt="Pro boxer landing a cross wearing Glover gloves"
              fill
              sizes="(max-width: 980px) 100vw, 40vw"
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
        </div>
      </section>

      <Tape dark items={["Protect your crown", "New drop", `Free shipping over $${site.freeShippingFrom}`]} />

      {/* ------------------------------- browser ------------------------------- */}
      <section className="section-dark pad-sm">
        <div className="wrap">
          <ShopBrowser products={products} initialCategory={category} initialCollection={collection} />
        </div>
      </section>

      {/* -------------------------------- help ---------------------------------- */}
      <section className="section-cream pad-sm">
        <div className="wrap cols cols-1-1 cols-center">
          <div>
            <span className="eyebrow on-cream bracket">Not sure which weight?</span>
            <h2 className="display h3" style={{ margin: ".3em 0 .4em" }}>
              Pick the glove for the work, not the label.
            </h2>
            <p className="body-copy" style={{ maxWidth: "48ch" }}>
              8–10 oz is competition territory. 12–14 oz covers most sparring. 16 oz is the standard
              for heavy sparring and anyone above 80 kg. If you only own one pair, buy 16 oz.
            </p>
            <Link className="btn btn-dark" href="/contact" style={{ marginTop: 24 }}>
              Ask a coach
            </Link>
          </div>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Weight</th>
                  <th>Body weight</th>
                  <th>Best for</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>8 oz</td>
                  <td>Under 60 kg</td>
                  <td>Professional bouts</td>
                </tr>
                <tr>
                  <td>10 oz</td>
                  <td>60 – 70 kg</td>
                  <td>Bouts, pad work</td>
                </tr>
                <tr>
                  <td>12 oz</td>
                  <td>60 – 75 kg</td>
                  <td>Sparring, bag work</td>
                </tr>
                <tr>
                  <td>14 oz</td>
                  <td>70 – 85 kg</td>
                  <td>Sparring, daily training</td>
                </tr>
                <tr>
                  <td>16 oz</td>
                  <td>80 kg +</td>
                  <td>Heavy sparring, all-round</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
