"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Stars from "./Stars";
import { cardImages, colourOptions, listPrice, inStock, type Product } from "@/lib/catalog";
import { money } from "@/lib/site";

export default function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const colours = colourOptions(product);
  const [activeColour, setActiveColour] = useState<string | null>(null);
  const { main, alt } = cardImages(product);
  const price = listPrice(product);
  const available = inStock(product);

  const selected = colours.find((c) => c.slug === activeColour);
  const mainSrc = selected?.image ?? main.src;
  const mainAlt = selected ? `${product.name} in ${selected.label}` : main.alt;
  // Hovering a single-image card just scales; with a second frame it cross-fades.
  const altSrc = alt && alt.src !== mainSrc ? alt : undefined;

  return (
    <article className="card reveal">
      <Link
        href={`/shop/${product.slug}`}
        className="card-media"
        data-single={altSrc ? "false" : "true"}
        aria-label={product.name}
      >
        <div className="card-badges">
          {product.badges.map((badge) => (
            <span key={badge} className={badge === "Sale" ? "tag tag-sale" : "tag"}>
              {badge}
            </span>
          ))}
          {!available ? <span className="tag">Sold out</span> : null}
        </div>

        <Image
          className="card-img-main"
          src={mainSrc}
          alt={mainAlt}
          fill
          sizes="(max-width: 620px) 92vw, (max-width: 1080px) 46vw, 30vw"
          priority={priority}
        />
        {altSrc ? (
          <Image
            className="card-img-alt"
            src={altSrc.src}
            alt=""
            fill
            sizes="(max-width: 620px) 92vw, (max-width: 1080px) 46vw, 30vw"
            style={altSrc.kind === "photo" ? { objectFit: "cover", padding: 0 } : undefined}
          />
        ) : null}

        <span className="card-quick">
          <span className="btn btn-solid btn-sm btn-block">View glove</span>
        </span>
      </Link>

      <div className="card-body">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
          <span className="eyebrow">{product.collection}</span>
          <Stars rating={product.rating} count={product.reviewCount} />
        </div>

        <h3 className="card-title">
          <Link href={`/shop/${product.slug}`}>{product.name}</Link>
        </h3>

        <p className="card-desc">{product.shortDescription}</p>

        {colours.length > 1 ? (
          <div className="swatches">
            {colours.map((colour) => (
              <button
                key={colour.slug}
                className="swatch"
                data-active={(activeColour ?? colours[0].slug) === colour.slug}
                title={colour.label}
                aria-label={`Preview ${colour.label}`}
                onClick={() => setActiveColour(colour.slug)}
                style={{
                  background: colour.accent
                    ? `linear-gradient(135deg, ${colour.hex} 0 50%, ${colour.accent} 50% 100%)`
                    : colour.hex,
                }}
              />
            ))}
            <span className="swatch-more">{colours.length} colours</span>
          </div>
        ) : (
          <div className="swatches">
            {colours.map((colour) => (
              <span
                key={colour.slug}
                className="swatch"
                title={colour.label}
                style={{
                  background: colour.accent
                    ? `linear-gradient(135deg, ${colour.hex} 0 50%, ${colour.accent} 50% 100%)`
                    : colour.hex,
                  cursor: "default",
                }}
              />
            ))}
            <span className="swatch-more">{colours[0]?.label}</span>
          </div>
        )}

        <p className="card-price">
          {price.was ? (
            <>
              <s>{money(price.was)}</s>
              <span className="sale-now">{money(price.now)}</span>
            </>
          ) : (
            <span>From {money(price.now)}</span>
          )}
        </p>
      </div>
    </article>
  );
}
