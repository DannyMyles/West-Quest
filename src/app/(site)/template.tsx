"use client";

import { motion } from "framer-motion";

/** Subtle fade/rise on every route change. Templates remount per navigation,
 *  so this runs each time. Respects reduced-motion via the CSS override that
 *  collapses transition durations globally. */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}
