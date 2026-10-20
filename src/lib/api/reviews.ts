import { api } from "./client";
import type { AdminReview, Review } from "@/lib/types";

export const fetchApprovedReviews = (sku: string) =>
  api<{ items: Review[] }>("/reviews", { query: { sku }, revalidate: 30 }).then((r) => r.items);

export const submitReview = (input: { productSku: string; customerName: string; rating: number; comment: string }) =>
  api<{ ok: true; message: string }>("/reviews", { method: "POST", json: input });

// --- admin ----------------------------------------------------------------------
export interface ReviewPage {
  items: AdminReview[];
  total: number;
  pendingCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const adminReviews = (query: { approved?: boolean; page?: number; limit?: number } = {}) =>
  api<ReviewPage>("/admin/reviews", { query });

export const adminSetReviewApproved = (id: number, approved: boolean) =>
  api<void>(`/admin/reviews/${id}`, { method: "PATCH", json: { approved } });

export const adminDeleteReview = (id: number) => api<void>(`/admin/reviews/${id}`, { method: "DELETE" });
