"use client";

import { useCallback, useEffect, useState } from "react";
import { getProducts } from "@/services/productService";
import type { Product } from "@/lib/types";

let cache: Product[] | null = null;

/** Shared product data source for every product-browsing surface (home
 *  search, catalogue page, featured rail) so results stay consistent. */
export function useProducts() {
  // Always start empty so the first client render matches the server's,
  // even when a streamed boundary hydrates after the cache has filled.
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    let active = true;
    setLoading(true);
    setError(false);
    getProducts()
      .then((result) => {
        if (!active) return;
        cache = result;
        setProducts(result);
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (cache) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProducts(cache);
      setLoading(false);
      return;
    }
    return load();
  }, [load]);

  const retry = useCallback(() => {
    cache = null;
    load();
  }, [load]);

  return { products, loading, error, retry };
}
