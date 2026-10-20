import { api } from "./client";
import type { Category } from "@/lib/types";

interface RawCategory {
  id: number;
  slug: string;
  name: string;
  shortName: string;
  description: string;
  icon: string;
  order: number;
  productCount: number;
  image?: string | null;
  active?: boolean;
}

const toCategory = (r: RawCategory): Category => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  shortName: r.shortName,
  description: r.description,
  icon: r.icon,
  order: r.order,
  productCount: r.productCount,
  image: r.image ?? null,
  active: r.active ?? true,
});

export const fetchCategories = () =>
  api<{ items: RawCategory[] }>("/categories").then((r) => r.items.map(toCategory));

export const adminCategories = () =>
  api<{ items: RawCategory[] }>("/admin/categories").then((r) => r.items.map(toCategory));

export interface CategoryInput {
  slug?: string;
  name?: string;
  shortName?: string;
  description?: string;
  icon?: string;
  sortOrder?: number;
  active?: boolean;
}

export const adminCreateCategory = (input: CategoryInput & { slug: string; name: string }) =>
  api<RawCategory>("/admin/categories", { method: "POST", json: input }).then(toCategory);

export const adminUpdateCategory = (id: number, patch: Omit<CategoryInput, "slug">) =>
  api<RawCategory>(`/admin/categories/${id}`, { method: "PATCH", json: patch }).then(toCategory);

export const adminDeleteCategory = (id: number, reassignTo?: string) =>
  api<void>(`/admin/categories/${id}`, { method: "DELETE", query: { reassignTo } });
