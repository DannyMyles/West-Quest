"use client";

import { useEffect, useState } from "react";
import { getCategories } from "@/services/categoryService";
import type { Category } from "@/lib/types";

let cache: Category[] | null = null;

export function useCategories() {
  // Always start empty so the first client render matches the server's,
  // even when a streamed boundary hydrates after the cache has filled.
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (cache) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCategories(cache);
      setLoading(false);
      return;
    }
    let active = true;
    getCategories().then((result) => {
      if (!active) return;
      cache = result;
      setCategories(result);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  return { categories, loading };
}
