import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import BookingWidget from "@/components/BookingWidget";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Book Training",
  description:
    "Book your Glover boxing training session with world-class coaches. Pick a time and step in.",
};

const details = [
  { label: "Location", value: site.address },
  { label: "Phone", value: site.phone },
  { label: "Hours", value: site.hours },
  { label: "Platform", value: "Acuity Scheduling" },
];

export default function BookTrainingPage() {
  return (
    <>
      <section className="section-cream">
        <div
          className="wrap"
          style={{ paddingTop: 56, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}
        >
          <span className="eyebrow on-cream bracket">Book training</span>
          <span className="eyebrow on-cream">// your first punch is a click away</span>
        </div>
        <div className="wrap" style={{ paddingBottom: 40 }}>
          <h1 className="display h1" style={{ margin: 0 }}>
            Your first
            <br />
            punch is a<br />
            click away.
          </h1>
          <p className="body-copy" style={{ maxWidth: "58ch", margin: "18px 0 0" }}>
            You can keep thinking about training. Keep saving it for &ldquo;next month&rdquo;. Or you
            can make the move right now — pick a time below and step in.
          </p>
        </div>
      </section>

      <section className="section-dark pad-sm">
        <div className="wrap cols cols-1-2">
          <aside className="booking-aside">
            <span className="eyebrow bracket">Details</span>
            <ul style={{ listStyle: "none", padding: 0, margin: "18px 0 0", display: "grid", gap: 18 }}>
              {details.map((detail) => (
                <li key={detail.label}>
                  <span className="eyebrow" style={{ display: "block", marginBottom: 4 }}>
                    {detail.label}
                  </span>
                  {detail.value}
                </li>
              ))}
            </ul>

            <div className="frame" style={{ aspectRatio: "4 / 5", position: "relative", marginTop: 26 }}>
              <Image
                src="/images/lifestyle/gym-pad-work.jpg"
                alt="Coach holding pads for a boxer in the Glover gym"
                fill
                sizes="(max-width: 860px) 100vw, 30vw"
                style={{ objectFit: "cover" }}
              />
            </div>

            <Link className="btn btn-ghost btn-block" href="/services" style={{ marginTop: 26 }}>
              See all services
            </Link>
          </aside>

          <div>
            {/*
              The client has selected Acuity (gloverboxing.as.me) but the calendar
              is not published yet, so the same journey is built natively here.
              On the WordPress build this is either wired to the Acuity API or
              replaced by their embed code — the steps do not change.
            */}
            <BookingWidget />

            <div className="trust" style={{ marginTop: 22 }}>
              <div>
                <strong>Free trial</strong>
                <small>First session on us</small>
              </div>
              <div>
                <strong>All levels</strong>
                <small>Never boxed? Start here</small>
              </div>
              <div>
                <strong>Gear provided</strong>
                <small>Gloves and wraps for trials</small>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
