import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "West Quest Limited — Devices on deposit",
    short_name: "West Quest",
    description: "Smartphones and tablets on deposit with daily payments over 6, 9 or 12 months.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fbf6ee",
    theme_color: "#b5481f",
    lang: "en-KE",
    categories: ["shopping", "finance", "business"],
  };
}
