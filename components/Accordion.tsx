"use client";

import { useState, type ReactNode } from "react";

export default function Accordion({
  items,
  initialOpen = 0,
}: {
  items: { title: string; content: ReactNode }[];
  initialOpen?: number | null;
}) {
  const [open, setOpen] = useState<number | null>(initialOpen);

  return (
    <div className="acc">
      {items.map((item, index) => {
        const isOpen = open === index;
        return (
          <div className="acc-item" key={item.title}>
            <button
              className="acc-btn"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : index)}
            >
              <span>{item.title}</span>
              <span aria-hidden="true">{isOpen ? "–" : "+"}</span>
            </button>
            {isOpen ? <div className="acc-panel">{item.content}</div> : null}
          </div>
        );
      })}
    </div>
  );
}
