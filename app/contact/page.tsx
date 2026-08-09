import type { Metadata } from "next";
import Image from "next/image";
import LeadForm from "@/components/LeadForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `Questions about gear, sizing, wholesale or training? Talk to the Glover team — ${site.email}`,
};

const details = [
  { label: "Address", value: site.address },
  { label: "Phone", value: site.phone },
  { label: "Email", value: site.email },
  { label: "Hours", value: site.hours },
];

export default function ContactPage() {
  return (
    <>
      <section className="section-dark">
        <div
          className="wrap"
          style={{ paddingTop: 60, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}
        >
          <span className="eyebrow bracket">Contact us</span>
          <span className="eyebrow">// let&rsquo;s work together</span>
        </div>

        <div
          className="wrap pad-sm cols cols-11-1 cols-center"
        >
          <div>
            <h1 className="display h1" style={{ margin: 0 }}>
              Let&rsquo;s work
              <br />
              together.
            </h1>
            <p className="muted" style={{ maxWidth: "46ch", margin: "18px 0 30px" }}>
              Questions about gear, sizing, wholesale, or training? Drop us a line and the Glover team
              will get back to you — usually within 48 hours.
            </p>

            <div className="detail-grid" style={{ maxWidth: 480 }}>
              {details.map((detail) => (
                <div key={detail.label}>
                  <span className="eyebrow" style={{ display: "block", marginBottom: 6 }}>
                    {detail.label}
                  </span>
                  {detail.label === "Email" ? (
                    <a className="link-underline" href={`mailto:${detail.value}`}>
                      {detail.value}
                    </a>
                  ) : (
                    detail.value
                  )}
                </div>
              ))}
              <div>
                <span className="eyebrow" style={{ display: "block", marginBottom: 6 }}>
                  Social
                </span>
                <a className="link-underline" href={site.instagram} target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
                {" · "}
                <a className="link-underline" href={site.facebook} target="_blank" rel="noopener noreferrer">
                  Facebook
                </a>
              </div>
            </div>
          </div>

          <div className="frame" style={{ aspectRatio: "3 / 4", position: "relative" }}>
            <Image
              src="/images/lifestyle/fight-night-collage.jpg"
              alt="Fight night moments from a Glover-equipped card"
              fill
              sizes="(max-width: 860px) 100vw, 45vw"
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
        </div>
      </section>

      <section className="section-cream pad-sm">
        <div className="wrap">
          <h2 className="display h3 reveal" style={{ margin: "0 0 .5em" }}>
            Send a message.
          </h2>
          <div>
            <LeadForm
              variant="cream"
              submitLabel="Send"
              successTitle="Message sent."
              successCopy="Thanks for reaching out. The Glover team reviews every message and will get back to you within 48 hours."
              fields={[
                { name: "name", label: "Name", placeholder: "Your name", required: true },
                { name: "phone", label: "Phone", type: "tel", placeholder: "Your phone" },
                { name: "email", label: "Email", type: "email", placeholder: "you@email.com", full: true, required: true },
                {
                  name: "topic",
                  label: "What is this about?",
                  type: "select",
                  options: ["Gear & sizing", "Order or return", "Wholesale", "Training", "Ambassador program", "Something else"],
                  full: true,
                },
                {
                  name: "message",
                  label: "Message",
                  type: "textarea",
                  rows: 5,
                  placeholder: "How can we help?",
                  full: true,
                  required: true,
                },
              ]}
            />
          </div>
        </div>
      </section>
    </>
  );
}
