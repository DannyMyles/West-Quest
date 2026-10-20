import { api } from "./client";
import type { Application, PaymentTier, TermMonths } from "@/lib/types";

export interface Customer {
  id: number;
  name: string;
  phone: string;
  location: string | null;
}

export type OrderStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Order {
  id: number;
  /** Customer-facing reference, e.g. "WC-K7Q2XM". */
  ref: string;
  items: { sku: string; name: string; slug: string; unitPrice: number; quantity: number }[];
  total: number;
  customer: { name: string; phone: string; location: string | null };
  notes: string | null;
  status: OrderStatus;
  adminNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CheckoutItem =
  | { mode: "plan"; productSlug: string; tier: PaymentTier; termMonths: TermMonths }
  | { mode: "cash"; productSlug: string; quantity: number };

export interface CheckoutInput {
  items: CheckoutItem[];
  location: string;
  idNumber?: string | null;
  notes?: string | null;
}

export const fetchMe = () => api<{ customer: Customer | null }>("/account/me").then((r) => r.customer);

export const login = (phone: string, password: string) =>
  api<{ customer: Customer }>("/account/login", { method: "POST", json: { phone, password } }).then((r) => r.customer);

export const register = (input: { name: string; phone: string; password: string }) =>
  api<{ customer: Customer }>("/account/register", { method: "POST", json: input }).then((r) => r.customer);

export const logout = () => api<void>("/account/logout", { method: "POST" });

export const fetchActivity = () => api<{ applications: Application[]; orders: Order[] }>("/account/activity");

export const checkout = (input: CheckoutInput) =>
  api<{ applications: Application[]; order: Order | null }>("/account/checkout", { method: "POST", json: input });

// --- admin ----------------------------------------------------------------------
export interface OrderPage {
  items: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const adminListOrders = (query: { status?: OrderStatus; q?: string; page?: number; limit?: number } = {}) =>
  api<OrderPage>("/admin/orders", { query });

export const adminGetOrder = (id: number) => api<Order>(`/admin/orders/${id}`);

export const adminUpdateOrder = (id: number, patch: { status?: OrderStatus; adminNotes?: string | null }) =>
  api<Order>(`/admin/orders/${id}`, { method: "PATCH", json: patch });
