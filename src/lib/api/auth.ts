import { api } from "./client";

export interface AdminUser {
  id: number;
  email: string;
  name: string;
}

export const adminLogin = (email: string, password: string) =>
  api<{ admin: AdminUser }>("/admin/auth/login", { method: "POST", json: { email, password } }).then((r) => r.admin);

export const adminLogout = () => api<void>("/admin/auth/logout", { method: "POST" });

export const adminMe = () => api<{ admin: AdminUser }>("/admin/auth/me").then((r) => r.admin);

export const adminChangePassword = (currentPassword: string, newPassword: string) =>
  api<void>("/admin/auth/change-password", { method: "POST", json: { currentPassword, newPassword } });

export interface AdminAccount extends AdminUser {
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export const adminList = () => api<{ items: AdminAccount[] }>("/admin/admins").then((r) => r.items);

export const adminCreate = (input: { email: string; name: string; password: string }) =>
  api<AdminAccount>("/admin/admins", { method: "POST", json: input });

export const adminUpdateAccount = (id: number, patch: { active?: boolean; password?: string; name?: string }) =>
  api<AdminAccount>(`/admin/admins/${id}`, { method: "PATCH", json: patch });

export const adminDeleteAccount = (id: number) => api<void>(`/admin/admins/${id}`, { method: "DELETE" });
