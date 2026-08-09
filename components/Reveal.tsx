"use client";

import { useEffect } from "react";

/**
 * Scroll-in animation for anything carrying `.reveal`.
 * Mounted once in the layout; re-scans on every route change so pages
 * navigated to client-side animate the same way as a fresh load.
 */
export default function Reveal() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12 },
    );

    const scan = () => {
      document.querySelectorAll(".reveal:not(.in)").forEach((el) => observer.observe(el));
    };
    scan();

    // Catch nodes added by client navigation or lazily rendered lists.
    const mutations = new MutationObserver(scan);
    mutations.observe(document.body, { childList: true, subtree: true });

    // Failsafe: never leave content invisible if the observer misfires.
    const failsafe = window.setTimeout(() => {
      document.querySelectorAll(".reveal:not(.in)").forEach((el) => el.classList.add("in"));
    }, 2500);

    return () => {
      observer.disconnect();
      mutations.disconnect();
      window.clearTimeout(failsafe);
    };
  }, []);

  return null;
}
