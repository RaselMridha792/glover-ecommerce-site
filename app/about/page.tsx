import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import Tape from "@/components/Tape";

export const metadata: Metadata = {
  title: "We Are Glover",
  description:
    "The Glover Sports story. Founded by As'im Smith in 2023 to close the gap between the gear athletes deserve and the gear they were sold.",
};

const values = [
  {
    title: "Craft",
    copy: "Premium full-grain leather, reinforced stitching, and meticulous pre-export checks on every pair before it leaves the line.",
  },
  {
    title: "Heritage",
    copy: "Traditional horsehair padding and lace-up closures. Where tradition meets innovation, not where it gets replaced by it.",
  },
  {
    title: "Community",
    copy: "A crown worn by fighters who train with intention — amateurs and seasoned professionals alike. Protect Your Crown.™",
  },
];

const timeline = [
  {
    year: "2023",
    title: "First line",
    copy: "Glover launches its first line of gloves on an initial investment, with a commitment that every release will surpass the last.",
  },
  {
    year: "2024",
    title: "In the ring",
    copy: "Glover gloves appear on fight cards and in gyms — the crown starts showing up where it counts.",
  },
  {
    year: "2025",
    title: "Pro Elite HH",
    copy: "The horsehair pro fight glove arrives: full-grain leather, authentic horsehair, traditional lace-up.",
  },
  {
    year: "Next",
    title: "Every sport",
    copy: "Expanding beyond boxing into equipment for all sports — because quality gear is what keeps athletes safe.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        image="/images/lifestyle/fight-night-victory.jpg"
        imageAlt="A fighter's hand raised in victory wearing Glover gloves"
        eyebrow="We Are Glover"
        meta="heritage · craft · crown"
        priority
        title={
          <>
            Prove it to
            <br />
            yourself,
            <br />
            not them.
          </>
        }
      />

      {/* ---------------------------- pushing boundaries ---------------------------- */}
      <section className="section-cream pad">
        <div className="wrap cols cols-1-15">
          <div>
            <span className="eyebrow on-cream bracket">Pushing boundaries</span>
            <Image
              src="/images/brand/glover-sports-lockup.png"
              alt="Glover Sports"
              width={1400}
              height={651}
              sizes="300px"
              style={{ width: "min(300px, 100%)", height: "auto", marginTop: 26 }}
            />
          </div>
          <div>
            <p className="lede" style={{ marginBottom: 24 }}>
              Glover Sports is dedicated to creating top-tier gloves tailored for athletes across all
              sports — blending innovative design with superior craftsmanship to meet the unique
              demands of different athletic activities.
            </p>
            <p className="body-copy" style={{ margin: "0 0 18px" }}>
              Each pair of gloves is developed with input from professionals and through rigorous
              testing to ensure comfort, durability, and protection. Whether for boxing, football,
              baseball, or other sports, Glover Sports prioritises athletes&rsquo; needs — delivering
              products that support peak performance and enhance overall gameplay.
            </p>
            <p className="body-copy" style={{ margin: 0 }}>
              We are not just gear. <strong>We are Glover.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* -------------------------------- founder --------------------------------- */}
      <section className="section-dark pad">
        <div className="wrap cols cols-09-11 cols-center">
          <div className="frame" style={{ aspectRatio: "3 / 4", position: "relative" }}>
            <Image
              src="/images/lifestyle/coach-lacing-up.jpg"
              alt="A coach lacing up a pair of crimson Glover gloves"
              fill
              sizes="(max-width: 860px) 100vw, 40vw"
              style={{ objectFit: "cover" }}
            />
          </div>

          <div>
            <span className="eyebrow bracket">Dreams to reality</span>
            <h2 className="display h2 reveal" style={{ margin: ".25em 0 .45em" }}>
              As&rsquo;im Smith
              <br />
              built the glove
              <br />
              he wanted.
            </h2>
            <p className="body-copy" style={{ margin: "0 0 16px" }}>
              Founded by As&rsquo;im Smith, a passionate innovator with a deep love for boxing, Glover
              Sports began as a dream to transform the athletic world. As&rsquo;im was not always a
              coach or trainer — his journey started as a devoted enthusiast with hands-on experience
              in the ring, where he recognised the gaps in the quality and safety of the gear athletes
              relied on.
            </p>
            <p className="body-copy" style={{ margin: "0 0 16px" }}>
              Driven by a vision to innovate, he set out to create sports equipment that combined
              durability, performance, style, and affordability — making the highest quality gear
              accessible to both professionals and everyday athletes.
            </p>
            <p className="body-copy" style={{ margin: 0 }}>
              From the very beginning, Glover Sports has focused on excellence, aiming to set new
              standards in sports equipment. Because ensuring athletes are safe and protected is what
              lets them enjoy their sport with confidence and peace of mind.
            </p>
          </div>
        </div>
      </section>

      {/* -------------------------------- values ---------------------------------- */}
      <section className="section-dark pad-sm">
        <div className="wrap grid-3">
          {values.map((value, index) => (
            <div className="numbered reveal" key={value.title}>
              <span className="tag">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="display h3" style={{ margin: ".4em 0 .3em" }}>
                {value.title}
              </h3>
              <p className="muted" style={{ margin: 0 }}>
                {value.copy}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Tape items={["Protect your crown", "We are Glover", "No compromise"]} />

      {/* ------------------------------- timeline --------------------------------- */}
      <section className="section-cream pad">
        <div className="wrap">
          <span className="eyebrow on-cream bracket">The road so far</span>
          <div className="grid-4" style={{ gap: 24, marginTop: 26 }}>
            {timeline.map((item) => (
              <div
                className="reveal"
                key={item.year}
                style={{ borderTop: "1px solid var(--line-dark)", paddingTop: 18 }}
              >
                <span className="mono" style={{ fontSize: 13, color: "var(--muted)" }}>
                  {item.year}
                </span>
                <h3 className="display" style={{ fontSize: 24, margin: ".4em 0 .3em" }}>
                  {item.title}
                </h3>
                <p className="body-copy" style={{ margin: 0, fontSize: 14 }}>
                  {item.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------- cta ----------------------------------- */}
      <section className="section-dark pad">
        <div className="wrap" style={{ textAlign: "center" }}>
          <h2 className="display h2">Step into the ring.</h2>
          <div className="row" style={{ justifyContent: "center", marginTop: 26 }}>
            <Link className="btn btn-solid" href="/shop">
              Shop the crown
            </Link>
            <Link className="btn btn-ghost" href="/book-training">
              Book training
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
