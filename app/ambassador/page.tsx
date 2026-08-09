import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import LeadForm from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Ambassador Program",
  description:
    "Become a Glover Sports boxing ambassador. Represent the crown, share the gear you train in, and earn as your community grows.",
};

const steps = [
  {
    title: "Apply",
    copy: "Tell us how you train and where your audience lives. We review every application weekly.",
  },
  {
    title: "Share",
    copy: "Get your unique code and gear discount. Share the crown with the people who already trust your judgement.",
  },
  {
    title: "Earn",
    copy: "Earn commission on every sale, plus rewards and early access as you climb the ranks.",
  },
];

export default function AmbassadorPage() {
  return (
    <>
      <PageHero
        image="/images/lifestyle/gym-two-fighters.jpg"
        imageAlt="Two fighters in the ring wearing Glover gloves"
        eyebrow="Ambassador Program"
        meta="represent the crown"
        compact
        priority
        title={
          <>
            Become a<br />
            Glover
            <br />
            ambassador.
          </>
        }
        intro="Fighters, coaches, and creators who move with purpose. Join the Glover Sports ambassador program, share the gear you train in, and earn as your community grows."
      />

      {/* ------------------------------ how it works ------------------------------ */}
      <section className="section-cream pad">
        <div className="wrap">
          <h2 className="display h3 reveal" style={{ margin: "0 0 .5em" }}>
            How it works.
          </h2>
          <div className="grid-3">
            {steps.map((step, index) => (
              <div
                className="reveal"
                key={step.title}
                style={{ borderTop: "1px solid var(--line-dark)", paddingTop: 18 }}
              >
                <span className="tag" style={{ color: "var(--ink)" }}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="display h3" style={{ margin: ".35em 0 .3em" }}>
                  {step.title}
                </h3>
                <p className="body-copy" style={{ margin: 0 }}>
                  {step.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------- apply ---------------------------------- */}
      <section className="section-dark pad">
        <div className="wrap cols cols-1-12">
          <div>
            <h2 className="display h2">Join the roster.</h2>
            <p className="muted" style={{ maxWidth: "40ch", marginTop: 14 }}>
              Interested in working together? Fill out some info and we will be in touch shortly. We
              can&rsquo;t wait to hear from you.
            </p>
            <p className="muted" style={{ maxWidth: "40ch", marginTop: 14 }}>
              Applications are reviewed weekly. If it&rsquo;s a fit, we&rsquo;ll be in touch with your
              ambassador kit.
            </p>
          </div>

          <LeadForm
            submitLabel="Apply now"
            successTitle="Application received."
            successCopy="We review every application weekly. If it's a fit, we'll be in touch with your ambassador kit and code."
            fields={[
              { name: "name", label: "Full name", placeholder: "Your name", required: true },
              { name: "email", label: "Email", type: "email", placeholder: "you@email.com", required: true },
              { name: "social", label: "Instagram / social", placeholder: "@handle", required: true },
              { name: "audience", label: "Audience size", placeholder: "e.g. 5k" },
              {
                name: "discipline",
                label: "You are a",
                type: "select",
                options: ["Fighter", "Coach", "Gym owner", "Creator", "Other"],
                full: false,
              },
              { name: "location", label: "Where you train", placeholder: "City, country" },
              {
                name: "why",
                label: "Why Glover?",
                type: "textarea",
                placeholder: "Tell us how you train.",
                full: true,
                required: true,
              },
            ]}
          />
        </div>
      </section>
    </>
  );
}
