import { api } from "./client";
import type { ApplicationStatus } from "@/lib/types";

export interface AdminStats {
  products: number;
  categories: number;
  pendingApplications: number;
  contactedApplications: number;
  approvedApplications: number;
  pendingReviews: number;
  pendingOrders: number;
  lowStock: { id: number; slug: string; name: string; stockCount: number }[];
  recentApplications: {
    id: number;
    ref: string;
    customerName: string;
    productName: string;
    status: ApplicationStatus;
    createdAt: string;
  }[];
}

export const adminStats = () => api<AdminStats>("/admin/stats");
