import type { Metadata } from "next";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { TrustBand } from "@/components/home/TrustBand";
import { CategoryTiles } from "@/components/home/CategoryTiles";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FeaturedRail } from "@/components/home/FeaturedRail";
import { BrandRails } from "@/components/home/BrandRails";
import { OffersRail } from "@/components/home/OffersRail";

export const metadata: Metadata = {
  title: { absolute: "West Quest Limited — Your next device, within reach" },
  description:
    "Smartphones and tablets on deposit, with daily payments over 6, 9 or 12 months. Apply in minutes — approval and collection handled over WhatsApp.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      <HeroCarousel />
      <TrustBand />
      <CategoryTiles />
      <HowItWorks />
      <FeaturedRail />
      <OffersRail />
      <BrandRails />
    </>
  );
}
