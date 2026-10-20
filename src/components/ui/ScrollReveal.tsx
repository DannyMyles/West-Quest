"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * Fades content up as it scrolls into view. Uses an IntersectionObserver
 * with a short timeout fallback so content is *never* left permanently
 * hidden if the observer doesn't fire (headless renders, no-JS-ish edge
 * cases, unusual scroll containers).
 */
export function ScrollReveal({
  children,
  delay = 0,
  y = 24,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reveal = () => setShown(true);

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          reveal();
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    observer.observe(el);

    // Safety net: never keep content hidden.
    const t = window.setTimeout(reveal, 600);
    return () => {
      observer.disconnect();
      window.clearTimeout(t);
    };
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
