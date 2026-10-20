import { fetchCategories } from "@/lib/api/categories";
import { categories as seedCategories } from "@/lib/data/categories";
import type { Category } from "@/lib/types";

/** Departments for the storefront (menu, filters, homepage, footer). Empty
 *  departments are left out so shoppers never land on "0 products"; if none
 *  have products yet, all are shown. Falls back to the built-in list if the
 *  API is unreachable. The admin loads its own, unfiltered list. */
export async function getCategories(): Promise<Category[]> {
  try {
    const remote = await fetchCategories();
    if (remote.length === 0) return seedCategories;
    const stocked = remote.filter((c) => (c.productCount ?? 0) > 0);
    return stocked.length > 0 ? stocked : remote;
  } catch {
    return seedCategories;
  }
}
