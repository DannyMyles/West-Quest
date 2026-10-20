"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as account from "@/lib/api/account";
import type { Customer } from "@/lib/api/account";

interface AccountState {
  customer: Customer | null;
  /** True until the first "who am I" check finishes. */
  loading: boolean;
  login: (phone: string, password: string) => Promise<Customer>;
  register: (input: { name: string; phone: string; password: string }) => Promise<Customer>;
  logout: () => Promise<void>;
}

const AccountContext = createContext<AccountState | null>(null);

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    account
      .fetchMe()
      .then((c) => active && setCustomer(c))
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (phone: string, password: string) => {
    const c = await account.login(phone, password);
    setCustomer(c);
    return c;
  }, []);

  const register = useCallback(async (input: { name: string; phone: string; password: string }) => {
    const c = await account.register(input);
    setCustomer(c);
    return c;
  }, []);

  const logout = useCallback(async () => {
    await account.logout().catch(() => {});
    setCustomer(null);
  }, []);

  const value = useMemo(() => ({ customer, loading, login, register, logout }), [customer, loading, login, register, logout]);
  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error("useAccount must be used within AccountProvider");
  return ctx;
}
