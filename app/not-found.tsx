import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section-dark pad" style={{ minHeight: "60vh", display: "flex", alignItems: "center" }}>
      <div className="wrap" style={{ textAlign: "center" }}>
        <Image
          src="/images/brand/crown-mark-transparent.png"
          alt=""
          width={329}
          height={512}
          style={{ width: 74, height: "auto", margin: "0 auto 26px", opacity: 0.75 }}
        />
        <span className="eyebrow bracket">404</span>
        <h1 className="display h1" style={{ margin: ".2em 0 .3em" }}>
          Slipped that one.
        </h1>
        <p className="muted" style={{ maxWidth: "42ch", margin: "0 auto 30px" }}>
          The page you were after isn&rsquo;t here. Head back to the shop and find your next pair.
        </p>
        <div className="row" style={{ justifyContent: "center" }}>
          <Link className="btn btn-solid" href="/shop">
            Shop the crown
          </Link>
          <Link className="btn btn-ghost" href="/">
            Back home
          </Link>
        </div>
      </div>
    </section>
  );
}
