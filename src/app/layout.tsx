import type { Metadata, Viewport } from "next";
import { Newsreader, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";
import { Toaster } from "@/components/ui/Toaster";
import {
  SUPPORT_PHONE_DISPLAY,
  SUPPORT_EMAIL,
  STORE_ADDRESS,
  SOCIAL_LINKS,
} from "@/lib/contact";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const title = "West Quest Limited — Your next device, within reach";
const description =
  "Smartphones and tablets on deposit, with daily payments over 6, 9 or 12 months. Apply in minutes — approval and collection handled over WhatsApp.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s · West Quest Limited",
  },
  description,
  applicationName: "West Quest Limited",
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: "West Quest Limited",
    locale: "en_KE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  themeColor: "#fbf6ee",
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "West Quest Limited",
  url: siteUrl,
  logo: `${siteUrl}/icon.svg`,
  email: SUPPORT_EMAIL,
  telephone: SUPPORT_PHONE_DISPLAY,
  address: {
    "@type": "PostalAddress",
    streetAddress: STORE_ADDRESS,
    addressLocality: "Nairobi",
    addressCountry: "KE",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: SUPPORT_PHONE_DISPLAY,
    contactType: "customer service",
    areaServed: "KE",
    availableLanguage: ["en", "sw"],
  },
  sameAs: SOCIAL_LINKS.map((s) => s.href),
};

const siteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "West Quest Limited",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteUrl}/catalogue?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${instrument.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([orgJsonLd, siteJsonLd]),
          }}
        />
        <ToastProvider>
          {children}
          <Toaster />
        </ToastProvider>
      </body>
    </html>
  );
}
