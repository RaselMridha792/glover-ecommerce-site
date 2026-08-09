import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Tape from "@/components/Tape";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Boxing training with world-class Glover coaches. Boxercise, strength and cardio — personalised sessions built around your skills and your goals.",
};

const tiers = [
  {
    number: "001",
    name: "Trial Session",
    price: "Free",
    copy: "One chance to feel the ring, the sweat, the pace. If it's not for you — fine. If it is, welcome to the grind.",
    tags: ["First step", "No excuses"],
    dark: false,
  },
  {
    number: "002",
    name: "Monthly Membership",
    price: "$120",
    copy: "Three sessions a week. Enough to change your body and your mindset. You'll earn every drop of progress — with work, not words.",
    tags: ["Discipline", "Progress"],
    dark: true,
  },
  {
    number: "003",
    name: "Personal Training",
    price: "$30",
    copy: "One-on-one with a coach who'll see through your excuses. Full focus. No hiding. Just results.",
    tags: ["Precision", "Intensity"],
    dark: false,
  },
];

const classes = [
  {
    title: "Boxercise",
    copy: "Rounds on the bag, ropes, and combination work. Conditioning that happens to teach you how to fight.",
    image: "/images/lifestyle/gym-pad-work.jpg",
    alt: "Boxer working the pads with a coach",
  },
  {
    title: "Strength Training",
    copy: "Barbell and bodyweight work built around the demands of the ring — hips, spine, grip, and the will to finish a set.",
    image: "/images/lifestyle/strength-training.jpg",
    alt: "Athlete setting up for a deadlift",
  },
  {
    title: "Cardio",
    copy: "Engine work. The difference between round three and round ten is built on the days nobody is watching.",
    image: "/images/lifestyle/conditioning.jpg",
    alt: "Athlete training on a gym rig",
  },
];

export default function ServicesPage() {
  return (
    <>
      <section className="section-cream">
        <div
          className="wrap"
          style={{ paddingTop: 56, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}
        >
          <span className="eyebrow on-cream bracket">Services</span>
          <span className="eyebrow on-cream">// we don&rsquo;t sell motivation. we sell process.</span>
        </div>
        <div className="wrap" style={{ paddingBottom: 40 }}>
          <h1 className="display h1" style={{ margin: 0 }}>
            We don&rsquo;t sell
            <br />
            motivation.
            <br />
            We sell process.
          </h1>
          <p className="body-copy" style={{ maxWidth: "60ch", margin: "18px 0 0" }}>
            Schedule your boxing training session with our world-class coaches. A personalised and
            professional experience tailored to enhance your skills and meet your fitness goals.
          </p>
        </div>
      </section>

      {/* --------------------------------- tiers ---------------------------------- */}
      <section className="section-cream" style={{ borderTop: "1px solid var(--line-dark)" }}>
        {tiers.map((tier) => (
          <div
            key={tier.number}
            className={tier.dark ? "section-dark tier" : "tier"}
            style={tier.dark ? { borderBottom: "1px solid var(--ink)" } : undefined}
          >
            <div className="wrap tier-inner">
              <h3 className="display" style={{ fontSize: "clamp(24px,3vw,38px)", margin: 0 }}>
                {tier.name}
              </h3>
              <div>
                <p style={{ margin: 0, color: tier.dark ? "var(--muted-dark)" : "#3a382f" }}>
                  {tier.copy}
                </p>
                <div className="row" style={{ gap: 8, marginTop: 12 }}>
                  {tier.tags.map((tag) => (
                    <span className="tag" key={tag} style={tier.dark ? undefined : { color: "var(--ink)" }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className="tag" style={tier.dark ? undefined : { color: "var(--ink)" }}>
                  {tier.number}
                </span>
                <div className="display" style={{ fontSize: 34, marginTop: 8 }}>
                  {tier.price}
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      <Tape dark items={["No compromise", "Prove it to yourself", "You are a fighter"]} />

      {/* -------------------------------- classes --------------------------------- */}
      <section className="section-dark pad">
        <div className="wrap">
          <div className="row-between" style={{ marginBottom: 34 }}>
            <div>
              <span className="eyebrow bracket">Classes</span>
              <h2 className="display h2 reveal" style={{ margin: ".2em 0 0" }}>
                Three ways in.
              </h2>
            </div>
            <Link className="btn btn-ghost" href="/book-training">
              Book a class →
            </Link>
          </div>

          <div className="grid-3">
            {classes.map((item) => (
              <article className="reveal" key={item.title}>
                <div className="frame" style={{ aspectRatio: "4 / 5", position: "relative" }}>
                  <Image
                    src={item.image}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 860px) 100vw, 33vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <h3 className="display h3" style={{ margin: ".5em 0 .3em" }}>
                  {item.title}
                </h3>
                <p className="muted" style={{ margin: 0 }}>
                  {item.copy}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------------------- competitions -------------------------------- */}
      <section className="section-dark pad" id="competitions" style={{ borderTop: "1px solid var(--line)" }}>
        <div className="wrap cols cols-1-1 cols-center">
          <div className="frame" style={{ aspectRatio: "1 / 1", position: "relative" }}>
            <Image
              src="/images/lifestyle/amateur-bout.jpg"
              alt="Two amateurs trading punches in front of a packed hall"
              fill
              sizes="(max-width: 860px) 100vw, 45vw"
              style={{ objectFit: "cover" }}
            />
          </div>
          <div>
            <span className="eyebrow bracket">Competitions</span>
            <h2 className="display h2" style={{ margin: ".3em 0 .4em" }}>
              Open fights — with judges, an audience, and real pressure.
            </h2>
            <p className="muted" style={{ margin: "0 0 22px" }}>
              Every session, every masterclass — another step toward the version of you that
              doesn&rsquo;t flinch. Training is one thing. Stepping into the ring is different.
            </p>
            <div className="row" style={{ gap: 10 }}>
              <span className="tag">Open Fights</span>
              <span className="tag">Club Tournaments</span>
              <span className="tag">Off-site Competitions</span>
              <span className="tag">Masterclasses</span>
            </div>
            <Link className="btn btn-solid" href="/book-training" style={{ marginTop: 28 }}>
              Book training
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
