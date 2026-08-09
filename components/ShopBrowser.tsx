"use client";

import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import {
  allColours,
  allSizes,
  CATEGORIES,
  colourOptions,
  priceRange,
  inStock,
  type Product,
} from "@/lib/catalog";

type SortKey = "featured" | "price-asc" | "price-desc" | "rating" | "newest";

const SORTS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
  { value: "newest", label: "Newest" },
];

const PRICE_BANDS = [
  { slug: "under-100", label: "Under $100", test: (min: number) => min < 100 },
  { slug: "100-160", label: "$100 – $160", test: (min: number) => min >= 100 && min <= 160 },
  { slug: "over-160", label: "Over $160", test: (min: number) => min > 160 },
];

type Facet = "category" | "collection" | "colour" | "size" | "closure" | "price" | "availability";

export default function ShopBrowser({
  products,
  initialCategory,
  initialCollection,
}: {
  products: Product[];
  initialCategory?: string;
  initialCollection?: string;
}) {
  const [selected, setSelected] = useState<Record<Facet, string[]>>({
    category: initialCategory ? [initialCategory] : [],
    collection: initialCollection ? [initialCollection] : [],
    colour: [],
    size: [],
    closure: [],
    price: [],
    availability: [],
  });
  const [sort, setSort] = useState<SortKey>("featured");
  const [railOpen, setRailOpen] = useState(false);

  const colours = useMemo(() => allColours(), []);
  const sizes = useMemo(() => allSizes(), []);

  const toggle = (facet: Facet, value: string) => {
    setSelected((current) => {
      const list = current[facet];
      return {
        ...current,
        [facet]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
      };
    });
  };

  const clearAll = () =>
    setSelected({
      category: [],
      collection: [],
      colour: [],
      size: [],
      closure: [],
      price: [],
      availability: [],
    });

  /** Only offer sub-collections that exist inside the chosen categories. */
  const visibleCollections = useMemo(() => {
    const scope = selected.category.length
      ? products.filter((p) => selected.category.includes(p.category))
      : products;
    return [...new Set(scope.map((p) => p.collection))];
  }, [products, selected.category]);

  const productSizes = (product: Product) =>
    product.attributes
      .filter((a) => a.slug === "weight" || a.slug === "size")
      .flatMap((a) => a.options.map((o) => o.slug));

  const productClosures = (product: Product) => {
    const attr = product.attributes.find((a) => a.slug === "closure");
    if (attr) return attr.options.map((o) => o.slug);
    // Products without a closure attribute are lace-up by construction.
    return ["lace-up"];
  };

  const filtered = useMemo(() => {
    const matched = products.filter((product) => {
      const { min } = priceRange(product);

      if (selected.category.length && !selected.category.includes(product.category)) return false;
      if (selected.collection.length && !selected.collection.includes(product.collection)) return false;
      if (
        selected.colour.length &&
        !colourOptions(product).some((c) => selected.colour.includes(c.slug))
      )
        return false;
      if (selected.size.length && !productSizes(product).some((s) => selected.size.includes(s)))
        return false;
      if (
        selected.closure.length &&
        !productClosures(product).some((c) => selected.closure.includes(c))
      )
        return false;
      if (
        selected.price.length &&
        !PRICE_BANDS.filter((b) => selected.price.includes(b.slug)).some((b) => b.test(min))
      )
        return false;
      if (selected.availability.includes("in-stock") && !inStock(product)) return false;

      return true;
    });

    const byPrice = (product: Product) => priceRange(product).min;

    switch (sort) {
      case "price-asc":
        return [...matched].sort((a, b) => byPrice(a) - byPrice(b));
      case "price-desc":
        return [...matched].sort((a, b) => byPrice(b) - byPrice(a));
      case "rating":
        return [...matched].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
      case "newest":
        return [...matched].sort(
          (a, b) => Number(b.badges.includes("New")) - Number(a.badges.includes("New")),
        );
      default:
        return matched;
    }
  }, [products, selected, sort]);

  const activeChips = (Object.entries(selected) as [Facet, string[]][]).flatMap(([facet, values]) =>
    values.map((value) => ({
      facet,
      value,
      label:
        facet === "colour"
          ? (colours.find((c) => c.slug === value)?.label ?? value)
          : facet === "size"
            ? (sizes.find((s) => s.slug === value)?.label ?? value)
            : facet === "price"
              ? (PRICE_BANDS.find((b) => b.slug === value)?.label ?? value)
              : facet === "closure"
                ? value === "velcro"
                  ? "Hook & Loop"
                  : "Lace-Up"
                : facet === "availability"
                  ? "In stock"
                  : value,
    })),
  );

  const countFor = (predicate: (product: Product) => boolean) => products.filter(predicate).length;

  return (
    <div className="shop-layout">
      <button
        className="btn btn-ghost btn-sm filter-toggle"
        onClick={() => setRailOpen((v) => !v)}
        aria-expanded={railOpen}
      >
        {railOpen ? "Hide filters" : `Filters${activeChips.length ? ` · ${activeChips.length}` : ""}`}
      </button>

      <aside className="filter-rail" data-open={railOpen}>
        <details className="filter-group" open>
          <summary>Category</summary>
          <div className="filter-opts">
            {CATEGORIES.map((category) => (
              <button
                key={category}
                className="filter-opt"
                data-on={selected.category.includes(category)}
                onClick={() => toggle("category", category)}
              >
                <span className="filter-box">{selected.category.includes(category) ? "✓" : ""}</span>
                {category}
                <span className="count">{countFor((p) => p.category === category)}</span>
              </button>
            ))}
          </div>
        </details>

        <details className="filter-group" open>
          <summary>Collection</summary>
          <div className="filter-opts">
            {visibleCollections.map((collection) => (
              <button
                key={collection}
                className="filter-opt"
                data-on={selected.collection.includes(collection)}
                onClick={() => toggle("collection", collection)}
              >
                <span className="filter-box">{selected.collection.includes(collection) ? "✓" : ""}</span>
                {collection}
                <span className="count">{countFor((p) => p.collection === collection)}</span>
              </button>
            ))}
          </div>
        </details>

        <details className="filter-group" open>
          <summary>Colour</summary>
          <div className="filter-opts">
            {colours.map((colour) => (
              <button
                key={colour.slug}
                className="filter-opt"
                data-on={selected.colour.includes(colour.slug)}
                onClick={() => toggle("colour", colour.slug)}
              >
                <span className="filter-box">{selected.colour.includes(colour.slug) ? "✓" : ""}</span>
                <span
                  className="filter-swatch"
                  style={{
                    background: colour.accent
                      ? `linear-gradient(135deg, ${colour.hex} 0 50%, ${colour.accent} 50% 100%)`
                      : colour.hex,
                  }}
                />
                {colour.label}
                <span className="count">
                  {countFor((p) => colourOptions(p).some((c) => c.slug === colour.slug))}
                </span>
              </button>
            ))}
          </div>
        </details>

        <details className="filter-group" open>
          <summary>Weight / size</summary>
          <div className="filter-opts">
            {sizes.map((size) => (
              <button
                key={size.slug}
                className="filter-opt"
                data-on={selected.size.includes(size.slug)}
                onClick={() => toggle("size", size.slug)}
              >
                <span className="filter-box">{selected.size.includes(size.slug) ? "✓" : ""}</span>
                {size.label}
                <span className="count">{countFor((p) => productSizes(p).includes(size.slug))}</span>
              </button>
            ))}
          </div>
        </details>

        <details className="filter-group">
          <summary>Closure</summary>
          <div className="filter-opts">
            {[
              { slug: "lace-up", label: "Lace-Up" },
              { slug: "velcro", label: "Hook & Loop" },
            ].map((closure) => (
              <button
                key={closure.slug}
                className="filter-opt"
                data-on={selected.closure.includes(closure.slug)}
                onClick={() => toggle("closure", closure.slug)}
              >
                <span className="filter-box">{selected.closure.includes(closure.slug) ? "✓" : ""}</span>
                {closure.label}
                <span className="count">
                  {countFor((p) => productClosures(p).includes(closure.slug))}
                </span>
              </button>
            ))}
          </div>
        </details>

        <details className="filter-group">
          <summary>Price</summary>
          <div className="filter-opts">
            {PRICE_BANDS.map((band) => (
              <button
                key={band.slug}
                className="filter-opt"
                data-on={selected.price.includes(band.slug)}
                onClick={() => toggle("price", band.slug)}
              >
                <span className="filter-box">{selected.price.includes(band.slug) ? "✓" : ""}</span>
                {band.label}
                <span className="count">{countFor((p) => band.test(priceRange(p).min))}</span>
              </button>
            ))}
          </div>
        </details>

        <details className="filter-group">
          <summary>Availability</summary>
          <div className="filter-opts">
            <button
              className="filter-opt"
              data-on={selected.availability.includes("in-stock")}
              onClick={() => toggle("availability", "in-stock")}
            >
              <span className="filter-box">{selected.availability.includes("in-stock") ? "✓" : ""}</span>
              In stock
              <span className="count">{countFor(inStock)}</span>
            </button>
          </div>
        </details>
      </aside>

      <div>
        {/* Category quick-nav mirrors the rail so the three ranges in the brief
            are one tap away without opening filters. */}
        <div className="chips" style={{ marginBottom: 22 }}>
          <button
            className="chip"
            data-on={selected.category.length === 0}
            onClick={() => setSelected((c) => ({ ...c, category: [], collection: [] }))}
            style={selected.category.length === 0 ? { borderColor: "var(--cream)" } : undefined}
          >
            All · {products.length}
          </button>
          {CATEGORIES.map((category) => {
            const on = selected.category.includes(category);
            return (
              <button
                key={category}
                className="chip"
                onClick={() =>
                  setSelected((c) => ({
                    ...c,
                    category: on ? [] : [category],
                    collection: [],
                  }))
                }
                style={on ? { borderColor: "var(--gold-lit)", color: "var(--gold-lit)" } : undefined}
              >
                {category} · {countFor((p) => p.category === category)}
              </button>
            );
          })}
        </div>

        <div className="shop-toolbar">
          <span className="eyebrow">
            {filtered.length} {filtered.length === 1 ? "product" : "products"}
          </span>
          <label style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span className="eyebrow">Sort</span>
            <select
              className="select"
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
            >
              {SORTS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {activeChips.length > 0 ? (
          <div className="chips" style={{ marginBottom: 24 }}>
            {activeChips.map((chip) => (
              <button
                key={`${chip.facet}-${chip.value}`}
                className="chip"
                onClick={() => toggle(chip.facet, chip.value)}
              >
                {chip.label} <span aria-hidden="true">✕</span>
              </button>
            ))}
            <button className="chip" onClick={clearAll} style={{ borderStyle: "dashed" }}>
              Clear all
            </button>
          </div>
        ) : null}

        {filtered.length === 0 ? (
          <div className="empty-state">
            <h3 className="display h4" style={{ marginTop: 0 }}>
              Nothing matches that combination.
            </h3>
            <p className="muted" style={{ maxWidth: "40ch", margin: "10px auto 22px" }}>
              Loosen a filter or clear them all to see the full range.
            </p>
            <button className="btn btn-ghost btn-sm" onClick={clearAll}>
              Clear filters
            </button>
          </div>
        ) : (
          <div className="product-grid">
            {filtered.map((product, index) => (
              <ProductCard key={product.slug} product={product} priority={index < 3} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
