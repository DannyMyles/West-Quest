import { Smartphone, Tablet, Package, Cable, Headphones, Speaker, Gamepad2, Camera, HardDrive, Laptop, type LucideIcon } from "lucide-react";

export const DEFAULT_CATEGORY_ICON: LucideIcon = Package;

/** Maps an icon key OR a category slug to a lucide icon. Index this directly
 *  (`categoryIconMap[key] ?? DEFAULT_CATEGORY_ICON`) so React sees a stable
 *  component reference rather than a call result. */
export const categoryIconMap: Record<string, LucideIcon> = {
  smartphone: Smartphone,
  smartphones: Smartphone,
  phone: Smartphone,
  phones: Smartphone,
  tablet: Tablet,
  tablets: Tablet,
  accessory: Cable,
  accessories: Cable,
  package: Package,
  audio: Headphones,
  speaker: Speaker,
  gaming: Gamepad2,
  gamepad: Gamepad2,
  camera: Camera,
  cameras: Camera,
  storage: HardDrive,
  "hard-drive": HardDrive,
  laptop: Laptop,
  laptops: Laptop,
};

export function categoryIcon(key?: string): LucideIcon {
  if (!key) return DEFAULT_CATEGORY_ICON;
  const k = key.toLowerCase();
  return categoryIconMap[k] ?? categoryIconMap[k.replace(/s$/, "")] ?? DEFAULT_CATEGORY_ICON;
}
