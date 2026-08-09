"use client";

import { useEffect, useRef } from "react";

/**
 * Scrolling marquee. The track is duplicated so the -50% keyframe loops
 * seamlessly; duplicating in an effect keeps the server markup clean.
 */
export default function Tape({ items, dark = false }: { items: string[]; dark?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = ref.current;
    if (!track || track.dataset.doubled === "true") return;
    track.innerHTML += track.innerHTML;
    track.dataset.doubled = "true";
  }, []);

  return (
    <div className={dark ? "tape dark" : "tape"} aria-hidden="true">
      <div className="tape-track" ref={ref}>
        {items.map((item) => (
          <span key={item}>
            {item}
            <span className="dot"> ✦ </span>
          </span>
        ))}
      </div>
    </div>
  );
}
