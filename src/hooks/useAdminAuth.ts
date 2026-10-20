"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { adminMe, type AdminUser } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { clearAdminSession } from "@/lib/adminSession";

type Status = "loading" | "signed-out" | "admin" | "error";

/** Asks the backend who the current session cookie belongs to. */
export function useAdminAuth() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [nonce, setNonce] = useState(0);
  // The admin layout stays mounted when the login page redirects into the
  // dashboard, so re-check on navigation unless we already know we're in.
  const pathname = usePathname();
  const isAdmin = useRef(false);

  /** Re-run the check — used by "try again" after a network blip. */
  const retry = useCallback(() => {
    setStatus("loading");
    setNonce((n) => n + 1);
  }, []);

  useEffect(() => {
    if (isAdmin.current && nonce === 0) return;
    let active = true;
    adminMe()
      .then((admin) => {
        if (!active) return;
        setUser(admin);
        isAdmin.current = true;
        setStatus("admin");
      })
      .catch((err) => {
        if (!active) return;
        if (err instanceof ApiError && err.status === 401) {
          clearAdminSession();
          isAdmin.current = false;
          setUser(null);
          setStatus("signed-out");
        } else {
          // Backend unreachable — don't claim the session is gone.
          setStatus("error");
        }
      });
    return () => {
      active = false;
    };
  }, [nonce, pathname]);

  return { user, status, retry };
}
