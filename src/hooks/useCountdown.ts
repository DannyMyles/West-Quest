"use client";

import { useEffect, useState } from "react";

interface Remaining {
  hours: string;
  minutes: string;
  seconds: string;
  done: boolean;
}

function diffTo(target: number): Remaining {
  const ms = Math.max(0, target - Date.now());
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return { hours: pad(h), minutes: pad(m), seconds: pad(s), done: ms === 0 };
}

/** Live ticking countdown to an arbitrary ISO datetime. Renders "--:--:--"
 *  on the server / first paint to avoid a hydration mismatch, then ticks.
 *  Pass `null`/`undefined` (or a past date) to get `done: true` immediately
 *  without starting a timer. */
export function useCountdownTo(targetIso: string | null | undefined): Remaining {
  const target = targetIso ? new Date(targetIso).getTime() : null;
  const [remaining, setRemaining] = useState<Remaining>({ hours: "--", minutes: "--", seconds: "--", done: false });

  useEffect(() => {
    if (!target || target <= Date.now()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRemaining({ hours: "00", minutes: "00", seconds: "00", done: true });
      return;
    }
    setRemaining(diffTo(target));
    const id = window.setInterval(() => setRemaining(diffTo(target)), 1000);
    return () => window.clearInterval(id);
  }, [target]);

  return remaining;
}
