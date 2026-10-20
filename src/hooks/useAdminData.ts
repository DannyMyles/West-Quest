"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Tiny module-level cache for admin reads so moving between admin pages
 * (Overview → Products → Applications …) doesn't refetch the same
 * unbounded collections every time. `refresh()` forces a re-read;
 * `mutate()` updates the cache optimistically after a write.
 */
const cache = new Map<string, unknown>();
const inflight = new Map<string, Promise<unknown>>();

export function invalidateAdminData(key?: string) {
  if (key) cache.delete(key);
  else cache.clear();
}

export function useAdminData<T>(key: string, fetcher: () => Promise<T>, enabled = true) {
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  const [data, setData] = useState<T | undefined>(() => cache.get(key) as T | undefined);
  const [loading, setLoading] = useState(enabled && !cache.has(key));
  const [error, setError] = useState(false);

  const run = useCallback(
    (force: boolean) => {
      if (!enabled) return;
      if (!force && cache.has(key)) {
        setData(cache.get(key) as T);
        setLoading(false);
        return;
      }
      let live = true;
      setLoading(true);
      setError(false);
      let p = force ? undefined : inflight.get(key);
      if (!p) {
        p = fetcherRef.current();
        inflight.set(key, p);
      }
      (p as Promise<T>)
        .then((res) => {
          cache.set(key, res);
          if (live) setData(res);
        })
        .catch(() => {
          if (live) setError(true);
        })
        .finally(() => {
          inflight.delete(key);
          if (live) setLoading(false);
        });
      return () => {
        live = false;
      };
    },
    [key, enabled]
  );

  useEffect(() => {
    // run() syncs React state with an async external source — expected here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    return run(false);
  }, [run]);

  const refresh = useCallback(() => {
    cache.delete(key);
    return run(true);
  }, [key, run]);

  const mutate = useCallback(
    (next: T) => {
      cache.set(key, next);
      setData(next);
    },
    [key]
  );

  return { data, loading, error, refresh, mutate };
}
