"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import Stars from "./Stars";
import Accordion from "./Accordion";
import { useCart } from "./CartProvider";
import { money, site } from "@/lib/site";
import type { Product, Variation } from "@/lib/catalog";

function matchesSelection(variation: Variation, selection: Record<string, string>): boolean {
  return Object.entries(selection).every(([key, value]) => variation.attrs[key] === value);
}

export default function ProductDetail({ product }: { product: Product }) {
  const { add } = useCart();

  /**
   * Open on each attribute's editorial default where that combination is
   * shippable, otherwise on the first combination the client can actually ship.
   */
  const initialSelection = useMemo(() => {
    const preferred: Record<string, string> = {};
    for (const attr of product.attributes) {
      preferred[attr.slug] = attr.defaultOption ?? attr.options[0].slug;
    }
    const exact = product.variations.find(
      (v) => matchesSelection(v, preferred) && v.stock > 0,
    );
    if (exact) return { ...exact.attrs };

    const fallback = product.variations.find((v) => v.stock > 0) ?? product.variations[0];
    return { ...fallback.attrs };
  }, [product]);

  const [selection, setSelection] = useState<Record<string, string>>(initialSelection);
  const [quantity, setQuantity] = useState(1);
  const [engraving, setEngraving] = useState("");
  const [wantsEngraving, setWantsEngraving] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [zoom, setZoom] = useState<{ on: boolean; x: number; y: number }>({ on: false, x: 50, y: 50 });
  const [showBuyBar, setShowBuyBar] = useState(false);

  const buyRef = useRef<HTMLDivElement>(null);

  const variation = useMemo(
    () => product.variations.find((v) => matchesSelection(v, selection)),
    [product, selection],
  );

  /**
   * An option is offerable when at least one in-stock variation carries it
   * alongside everything else currently picked — the same rule WooCommerce
   * uses to grey out impossible combinations.
   */
  const isOptionAvailable = (attrSlug: string, optionSlug: string) => {
    const rest = { ...selection };
    delete rest[attrSlug];
    return product.variations.some(
      (v) => v.attrs[attrSlug] === optionSlug && matchesSelection(v, rest) && v.stock > 0,
    );
  };

  const choose = (attrSlug: string, optionSlug: string) => {
    setSelection((current) => {
      const next = { ...current, [attrSlug]: optionSlug };

      // Picking a colour can strand the weight that was selected. Slide across
      // to the nearest in-stock sibling instead of showing "unavailable".
      for (const attr of product.attributes) {
        if (attr.slug === attrSlug) continue;
        const stillValid = product.variations.some(
          (v) => matchesSelection(v, next) && v.stock > 0,
        );
        if (stillValid) break;
        const rescue = product.variations.find(
          (v) => v.attrs[attrSlug] === optionSlug && v.stock > 0,
        );
        if (rescue) return { ...rescue.attrs };
      }
      return next;
    });

    if (attrSlug === "colour") {
      const index = product.images.findIndex((img) => img.colour === optionSlug);
      if (index >= 0) setActiveImage(index);
    }
  };

  // Reveal the sticky buy bar once the real buy block has scrolled away.
  useEffect(() => {
    const node = buyRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowBuyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const image = product.images[activeImage] ?? product.images[0];
  const unitPrice =
    (variation?.salePrice ?? variation?.price ?? product.basePrice) +
    (wantsEngraving && product.personalisation ? product.personalisation.price : 0);
  const wasPrice = variation?.salePrice === undefined ? undefined : variation.price;
  const stock = variation?.stock ?? 0;
  const stockState = stock === 0 ? "out" : stock <= 12 ? "low" : "in";

  const optionLabels = product.attributes.map((attr) => {
    const option = attr.options.find((o) => o.slug === selection[attr.slug]);
    return option?.label ?? "";
  });

  const addToBag = () => {
    if (!variation || stock === 0) return;
    add({
      productSlug: product.slug,
      productName: product.name,
      variationId: variation.id,
      sku: variation.sku,
      optionLabels,
      unitPrice,
      image: variation.image,
      quantity,
      personalisation: wantsEngraving && engraving.trim() ? engraving.trim().toUpperCase() : undefined,
    });
  };

  return (
    <>
      <section className="section-dark pad-sm">
        <div className="wrap pdp">
          {/* ------------------------------ gallery ------------------------------ */}
          <div className="pdp-gallery">
            <div className="pdp-thumbs">
              {product.images.map((img, index) => (
                <button
                  key={img.src + index}
                  className="pdp-thumb"
                  data-active={index === activeImage}
                  data-kind={img.kind}
                  onClick={() => setActiveImage(index)}
                  aria-label={`View image ${index + 1}`}
                >
                  <Image src={img.src} alt="" width={168} height={168} />
                </button>
              ))}
            </div>

            <div
              className="pdp-stage"
              data-kind={image.kind}
              data-zoom={zoom.on}
              onMouseEnter={() => setZoom((z) => ({ ...z, on: true }))}
              onMouseLeave={() => setZoom((z) => ({ ...z, on: false }))}
              onMouseMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                setZoom({
                  on: true,
                  x: ((event.clientX - rect.left) / rect.width) * 100,
                  y: ((event.clientY - rect.top) / rect.height) * 100,
                });
              }}
            >
              <div className="pdp-stage-badges">
                {product.badges.map((badge) => (
                  <span key={badge} className={badge === "Sale" ? "tag tag-sale" : "tag"}>
                    {badge}
                  </span>
                ))}
              </div>
              <Image
                src={image.src}
                alt={image.alt}
                width={1200}
                height={1200}
                priority
                style={{ transformOrigin: `${zoom.x}% ${zoom.y}%` }}
              />
            </div>

            {product.artworkNote ? (
              <p
                className="field-hint"
                style={{ gridColumn: "1 / -1", margin: "14px 0 0", lineHeight: 1.6 }}
              >
                {product.artworkNote}
              </p>
            ) : null}
          </div>

          {/* ------------------------------- info -------------------------------- */}
          <div className="pdp-info">
            <div>
              <span className="eyebrow bracket">{product.collection}</span>
              <h1 className="display" style={{ fontSize: "clamp(32px,4.4vw,54px)", margin: ".25em 0 .15em" }}>
                {product.name}
              </h1>
              <p className="muted" style={{ margin: 0 }}>
                {product.subtitle}
              </p>
            </div>

            <div className="price-row">
              <span className="price-now">{money(unitPrice)}</span>
              {wasPrice ? <s className="price-was">{money(wasPrice)}</s> : null}
              {wasPrice ? (
                <span className="tag tag-sale price-off">
                  Save {Math.round(((wasPrice - (variation?.salePrice ?? wasPrice)) / wasPrice) * 100)}%
                </span>
              ) : null}
            </div>

            <Stars rating={product.rating} count={product.reviewCount} />

            <p className="body-copy" style={{ marginTop: 4 }}>
              {product.shortDescription}
            </p>

            {/* ---------------------------- variations --------------------------- */}
            <div>
              {product.attributes.map((attr) => {
                const currentLabel =
                  attr.options.find((o) => o.slug === selection[attr.slug])?.label ?? "";
                return (
                  <div className="opt-group" key={attr.slug}>
                    <div className="opt-head">
                      <span className="opt-label">{attr.name}</span>
                      <span className="opt-value">{currentLabel}</span>
                    </div>

                    {attr.kind === "swatch" ? (
                      <div className="opt-list">
                        {attr.options.map((option) => (
                          <button
                            key={option.slug}
                            className="opt-chip"
                            data-on={selection[attr.slug] === option.slug}
                            onClick={() => choose(attr.slug, option.slug)}
                            title={option.label}
                          >
                            <span
                              className="opt-chip-swatch"
                              style={
                                option.image
                                  ? { backgroundImage: `url(${option.image})`, backgroundSize: "contain", backgroundRepeat: "no-repeat", backgroundColor: "var(--cream)" }
                                  : {
                                      background: option.accent
                                        ? `linear-gradient(135deg, ${option.hex} 0 50%, ${option.accent} 50% 100%)`
                                        : option.hex,
                                    }
                              }
                            />
                            <span className="opt-chip-name">{option.label}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="opt-list">
                        {attr.options.map((option) => {
                          const available = isOptionAvailable(attr.slug, option.slug);
                          return (
                            <button
                              key={option.slug}
                              className="opt-pill"
                              data-on={selection[attr.slug] === option.slug}
                              disabled={!available}
                              title={available ? option.note : "Out of stock"}
                              onClick={() => choose(attr.slug, option.slug)}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {attr.slug === "weight" ? (
                      <p className="field-hint" style={{ marginTop: 10 }}>
                        {attr.options.find((o) => o.slug === selection.weight)?.note ?? ""} ·{" "}
                        <a className="link-underline" href="#sizing">
                          Size guide
                        </a>
                      </p>
                    ) : null}
                  </div>
                );
              })}

              {/* --------------------------- personalise --------------------------- */}
              {product.personalisation ? (
                <div className="opt-group">
                  <div className="opt-head">
                    <span className="opt-label">Personalise</span>
                    <span className="opt-value">
                      {wantsEngraving ? `+${money(product.personalisation.price)}` : "Optional"}
                    </span>
                  </div>

                  <button
                    className="opt-pill"
                    data-on={wantsEngraving}
                    style={{ width: "100%", textAlign: "left" }}
                    onClick={() => setWantsEngraving((v) => !v)}
                  >
                    {wantsEngraving ? "✓ " : "+ "}
                    {product.personalisation.label}
                  </button>

                  {wantsEngraving ? (
                    <div className="field field-inline" style={{ marginTop: 12 }}>
                      <label htmlFor="engraving">Cuff text</label>
                      <input
                        id="engraving"
                        value={engraving}
                        maxLength={product.personalisation.maxLength}
                        placeholder="YOUR NAME"
                        onChange={(event) => setEngraving(event.target.value.toUpperCase())}
                        style={{ textTransform: "uppercase", letterSpacing: ".08em" }}
                      />
                      <p className="field-hint" style={{ margin: "8px 0 0" }}>
                        {engraving.length}/{product.personalisation.maxLength} ·{" "}
                        {product.personalisation.hint}
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            {/* ------------------------------- buy ------------------------------- */}
            <div ref={buyRef} style={{ display: "grid", gap: 14 }}>
              <div style={{ display: "grid", gap: 6 }}>
                <div className="stock-line">
                  <span className="dot-status" data-state={stockState} />
                  {stock === 0
                    ? "Sold out in this combination"
                    : stock <= 12
                      ? `Only ${stock} left`
                      : "In stock · ships in 1–2 business days"}
                </div>
                {variation ? <span className="field-hint">SKU {variation.sku}</span> : null}
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <div className="qty">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                    −
                  </button>
                  <span>{quantity}</span>
                  <button onClick={() => setQuantity((q) => Math.min(10, q + 1))} aria-label="Increase quantity">
                    +
                  </button>
                </div>
                <button
                  className="btn btn-solid"
                  style={{ flex: 1, minWidth: 200 }}
                  disabled={stock === 0}
                  onClick={addToBag}
                >
                  {stock === 0 ? "Sold out" : `Add to bag — ${money(unitPrice * quantity)}`}
                </button>
              </div>

              <Link className="btn btn-ghost" href="/book-training">
                Book a fitting session
              </Link>
            </div>

            <div className="trust">
              <div>
                <strong>Free shipping</strong>
                <small>On orders over ${site.freeShippingFrom}</small>
              </div>
              <div>
                <strong>30-day returns</strong>
                <small>Unused, in original box</small>
              </div>
              <div>
                <strong>Pre-export QC</strong>
                <small>Every pair checked by hand</small>
              </div>
            </div>

            <Accordion
              items={[
                {
                  title: "Description",
                  content: (
                    <div style={{ display: "grid", gap: 14 }}>
                      {product.description.map((paragraph) => (
                        <p className="body-copy" key={paragraph.slice(0, 40)} style={{ margin: 0 }}>
                          {paragraph}
                        </p>
                      ))}
                      <ul className="feature-list">
                        {product.features.map((feature) => (
                          <li key={feature}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  ),
                },
                {
                  title: "Specifications",
                  content: (
                    <ul className="spec-list">
                      {product.specs.map(([key, value]) => (
                        <li key={key}>
                          <span className="spec-key">{key}</span>
                          <span>{value}</span>
                        </li>
                      ))}
                    </ul>
                  ),
                },
                {
                  title: "Shipping & returns",
                  content: (
                    <div className="body-copy" style={{ display: "grid", gap: 12 }}>
                      <p style={{ margin: 0 }}>
                        Orders ship from our warehouse within 1–2 business days. Free standard
                        shipping on orders over ${site.freeShippingFrom}; express is available at
                        checkout.
                      </p>
                      <p style={{ margin: 0 }}>
                        Unused gloves in their original box can be returned within 30 days.
                        Personalised pairs are made to order and cannot be returned unless faulty.
                      </p>
                    </div>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ------------------------------ sticky buy bar ------------------------------ */}
      <div className="buybar" data-show={showBuyBar}>
        <div className="buybar-inner">
          <div className="buybar-thumb">
            <Image src={variation?.image ?? image.src} alt="" width={92} height={92} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "var(--font-cond)",
                fontWeight: 700,
                letterSpacing: ".04em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {product.name}
            </div>
            <div className="field-hint">{optionLabels.filter(Boolean).join(" · ")}</div>
          </div>
          <button className="btn btn-solid btn-sm" disabled={stock === 0} onClick={addToBag}>
            {stock === 0 ? "Sold out" : `Add — ${money(unitPrice * quantity)}`}
          </button>
        </div>
      </div>
    </>
  );
}
