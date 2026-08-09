"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCart } from "./CartProvider";
import { money, site } from "@/lib/site";

export default function CartDrawer() {
  const { lines, subtotal, count, open, setOpen, setQuantity, remove, toast } = useCart();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const remaining = Math.max(0, site.freeShippingFrom - subtotal);

  return (
    <>
      {toast ? <div className="toast">{toast}</div> : null}

      {open ? (
        <>
          <button className="scrim" aria-label="Close cart" onClick={() => setOpen(false)} />
          <div
            className="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping bag"
            tabIndex={-1}
            ref={panelRef}
          >
            <div className="drawer-head">
              <strong className="display" style={{ fontSize: 22 }}>
                Your bag {count > 0 ? `· ${count}` : ""}
              </strong>
              <button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close">
                ✕
              </button>
            </div>

            <div className="drawer-body">
              {lines.length === 0 ? (
                <div style={{ padding: "60px 0", textAlign: "center" }}>
                  <p className="muted" style={{ marginBottom: 22 }}>
                    Your bag is empty.
                  </p>
                  <Link className="btn btn-ghost btn-sm" href="/shop" onClick={() => setOpen(false)}>
                    Shop the crown
                  </Link>
                </div>
              ) : (
                lines.map((line) => (
                  <div className="drawer-line" key={line.key}>
                    <Link
                      href={`/shop/${line.productSlug}`}
                      className="drawer-thumb"
                      onClick={() => setOpen(false)}
                    >
                      <Image src={line.image} alt={line.productName} width={144} height={144} />
                    </Link>
                    <div style={{ display: "grid", gap: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                        <Link
                          href={`/shop/${line.productSlug}`}
                          onClick={() => setOpen(false)}
                          style={{ fontFamily: "var(--font-cond)", fontWeight: 700, letterSpacing: ".03em" }}
                        >
                          {line.productName}
                        </Link>
                        <button
                          className="icon-btn"
                          style={{ fontSize: 15 }}
                          onClick={() => remove(line.key)}
                          aria-label={`Remove ${line.productName}`}
                        >
                          ✕
                        </button>
                      </div>
                      <span className="eyebrow" style={{ letterSpacing: ".08em" }}>
                        {line.optionLabels.join(" · ")}
                      </span>
                      {line.personalisation ? (
                        <span className="field-hint" style={{ color: "var(--gold-lit)" }}>
                          Engraved “{line.personalisation}”
                        </span>
                      ) : null}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginTop: 4,
                        }}
                      >
                        <div className="qty" style={{ transform: "scale(.82)", transformOrigin: "left" }}>
                          <button
                            onClick={() => setQuantity(line.key, line.quantity - 1)}
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span>{line.quantity}</span>
                          <button
                            onClick={() => setQuantity(line.key, line.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                        <span className="mono">{money(line.unitPrice * line.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {lines.length > 0 ? (
              <div className="drawer-foot">
                {remaining > 0 ? (
                  <p className="field-hint" style={{ margin: "0 0 12px" }}>
                    {money(remaining)} away from free shipping
                  </p>
                ) : (
                  <p className="field-hint" style={{ margin: "0 0 12px", color: "var(--gold-lit)" }}>
                    Free shipping unlocked
                  </p>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    marginBottom: 16,
                  }}
                >
                  <span className="eyebrow">Subtotal</span>
                  <strong className="mono" style={{ fontSize: 20 }}>
                    {money(subtotal)}
                  </strong>
                </div>
                <button className="btn btn-solid btn-block">Checkout</button>
                <p className="field-hint" style={{ textAlign: "center", margin: "12px 0 0" }}>
                  Prototype only — checkout is wired up in WooCommerce
                </p>
              </div>
            ) : null}
          </div>
        </>
      ) : null}
    </>
  );
}
