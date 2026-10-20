"use client";

import { useEffect, useState } from "react";

/** SSR-safe `prefers-reduced-motion` reader. Starts `false` so the server
 *  and first client render agree, then updates after mount. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}
