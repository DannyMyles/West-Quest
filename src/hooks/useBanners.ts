"use client";

import { useEffect, useState } from "react";
import { getBanners } from "@/services/bannerService";
import type { Banner } from "@/lib/types";

let cache: Banner[] | null = null;

export function useBanners() {
  // Always start empty so the first client render matches the server's.
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (cache) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBanners(cache);
      setLoading(false);
      return;
    }
    let active = true;
    getBanners().then((result) => {
      if (!active) return;
      cache = result;
      setBanners(result);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { banners, loading };
}
