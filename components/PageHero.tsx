import Image from "next/image";
import type { ReactNode } from "react";

/**
 * Full-bleed photographic hero used on the home page and the top of each
 * secondary page. The image sits behind a fixed scrim so display type stays
 * legible whatever the photograph is doing underneath.
 */
export default function PageHero({
  image,
  imageAlt,
  eyebrow,
  meta,
  title,
  intro,
  children,
  compact = false,
  priority = false,
}: {
  image: string;
  imageAlt: string;
  eyebrow: string;
  meta?: string;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  compact?: boolean;
  priority?: boolean;
}) {
  return (
    <section className={compact ? "bg-photo hero hero-sub" : "bg-photo hero"}>
      <Image
        className="bg-photo-img"
        src={image}
        alt={imageAlt}
        fill
        priority={priority}
        sizes="100vw"
      />

      <div className="bg-photo-content wrap" style={{ paddingTop: 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <span className="eyebrow bracket">{eyebrow}</span>
          {meta ? <span className="eyebrow">// {meta}</span> : null}
        </div>
      </div>

      <div className="bg-photo-content wrap" style={{ paddingBottom: 56 }}>
        <h1 className="display h1" style={{ margin: 0, maxWidth: "16ch" }}>
          {title}
        </h1>
        {intro ? (
          <p style={{ maxWidth: "56ch", color: "var(--cream-2)", margin: "18px 0 0" }}>{intro}</p>
        ) : null}
        {children ? <div style={{ marginTop: 30 }}>{children}</div> : null}
      </div>
    </section>
  );
}
