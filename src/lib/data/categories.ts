import { Category } from "@/lib/types";

/** Fallback category list, used only if the backend API is unreachable.
 *  The live list comes from the API (managed from /admin/categories). */
export const categories: Category[] = [
  {
    slug: "smartphones",
    name: "Smartphones",
    shortName: "Phones",
    description: "Phones on deposit + daily payments",
    icon: "smartphone",
  },
  {
    slug: "tablets",
    name: "Tablets",
    shortName: "Tablets",
    description: "Tablets on deposit + daily payments",
    icon: "tablet",
  },
  {
    slug: "accessories",
    name: "Accessories",
    shortName: "Accessories",
    description: "Cases, chargers, earphones and more",
    icon: "accessories",
  },
];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}
