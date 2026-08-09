"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "./CartProvider";
import { nav, site } from "@/lib/site";

export default function SiteHeader() {
  const pathname = usePathname();
  const { count, setOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile sheet whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <div className="announce">
        Free shipping over ${site.freeShippingFrom} · Protect Your Crown™
      </div>

      <header className="site-head">
        <div className="site-head-inner">
          <Link className="brand" href="/">
            <Image
              className="brand-mark"
              src="/images/brand/crown-mark-transparent.png"
              alt=""
              width={66}
              height={102}
              priority
            />
            Glover<span>°</span>
          </Link>

          <nav className="nav">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} data-active={isActive(item.href)}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="nav-cta">
            <button
              className="cart-ico"
              data-filled={count > 0}
              onClick={() => setOpen(true)}
              aria-label={`Open bag, ${count} items`}
            >
              Cart · {count}
            </button>
            <Link className="btn btn-ghost btn-sm" href="/book-training">
              Book Training
            </Link>
            <button
              className="burger"
              aria-label="Menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        <div className="mobile-nav" data-open={menuOpen}>
          {nav.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
          <Link href="/book-training" style={{ color: "var(--gold-lit)" }}>
            Book Training
          </Link>
        </div>
      </header>
    </>
  );
}
