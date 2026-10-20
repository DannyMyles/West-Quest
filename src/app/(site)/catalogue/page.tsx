import { Suspense } from "react";
import { Metadata } from "next";
import { CatalogueView } from "./CatalogueView";

export const metadata: Metadata = {
  title: "All Devices",
  description: "Browse smartphones and tablets on deposit with daily payments over 6, 9 or 12 months.",
  alternates: { canonical: "/catalogue" },
  openGraph: {
    title: "All Devices · West Quest Limited",
    description: "Smartphones and tablets on deposit — apply in minutes, confirm over WhatsApp.",
    url: "/catalogue",
    type: "website",
  },
};

export default function CataloguePage() {
  return (
    <Suspense fallback={null}>
      <CatalogueView />
    </Suspense>
  );
}
