import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";

const columns = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All products" },
      { href: "/shop?category=Boxing+Gloves", label: "Boxing gloves" },
      { href: "/shop?category=Apparel", label: "Apparel" },
      { href: "/shop?category=Equipment+%26+Accessories", label: "Equipment & accessories" },
    ],
  },
  {
    title: "Train",
    links: [
      { href: "/services", label: "Services" },
      { href: "/book-training", label: "Book training" },
      { href: "/services#competitions", label: "Competitions" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Glover" },
      { href: "/ambassador", label: "Ambassador program" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="section-dark">
      <div className="wrap">
        <div className="foot-cols">
          <div>
            <Link href="/" aria-label="Glover Sports — home" style={{ display: "inline-block" }}>
              <Image
                src="/images/brand/glover-sports-lockup.png"
                alt="Glover Sports"
                width={1400}
                height={651}
                sizes="260px"
                style={{ width: 260, height: "auto" }}
              />
            </Link>
            <p className="muted" style={{ maxWidth: "34ch", marginTop: 18 }}>
              Premium fight equipment built to perform, designed to stand out. Trusted by fighters
              who train with intention and move with purpose.
            </p>
            <p className="mono" style={{ fontSize: 13, marginTop: 18 }}>
              <a className="link-underline" href={`mailto:${site.email}`}>
                {site.email}
              </a>
              <br />
              <span className="muted">{site.phone}</span>
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h4>{column.title}</h4>
              {column.links.map((link) => (
                <Link key={link.href + link.label} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mega-word">GLOVER</div>

      <div className="foot-strip">
        <div className="wrap">
          <Link href="/about">About</Link>
          <Link href="/shop">Shop</Link>
          <Link href="/services">Services</Link>
          <Link href="/book-training">Book Training</Link>
          <Link href="/ambassador">Ambassador</Link>
          <Link href="/contact">Contact</Link>
          <span>{site.email}</span>
        </div>
      </div>

      <div className="wrap foot-meta">
        <span>© {new Date().getFullYear()} Glover Boxing — Protect Your Crown™</span>
        <span>
          <a className="link-underline" href={site.instagram} target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
          {" · "}
          <a className="link-underline" href={site.facebook} target="_blank" rel="noopener noreferrer">
            Facebook
          </a>
        </span>
      </div>
    </footer>
  );
}
