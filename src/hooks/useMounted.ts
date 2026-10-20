"use client";

import { useEffect, useState } from "react";

/** True after the first client-side commit. Use to gate rendering of values
 *  that can legitimately differ between the server and the hydrated client
 *  (e.g. counts derived from a client-only data cache). */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // Flip once after hydration so SSR and the first client render agree.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  return mounted;
}
