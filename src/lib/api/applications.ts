import { api } from "./client";
import type { Application, ApplicationStatus } from "@/lib/types";

// --- admin ----------------------------------------------------------------------
export interface ApplicationPage {
  items: Application[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const adminListApplications = (query: { status?: ApplicationStatus; q?: string; page?: number; limit?: number } = {}) =>
  api<ApplicationPage>("/admin/applications", { query });

export const adminGetApplication = (id: number) => api<Application>(`/admin/applications/${id}`);

export const adminUpdateApplication = (id: number, patch: { status?: ApplicationStatus; adminNotes?: string | null }) =>
  api<Application>(`/admin/applications/${id}`, { method: "PATCH", json: patch });
