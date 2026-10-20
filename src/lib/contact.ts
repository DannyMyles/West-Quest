/** Single source of truth for West Quest Limited contact details.
 *  Swap these for real values (or env vars) before going live. */

export const BRAND_NAME = "West Quest Limited";
export const BRAND_TAGLINE = "Your next device, within reach";

/** WhatsApp / phone — digits only, 2547XXXXXXXX form for wa.me + tel: links. */
export const WHATSAPP_NUMBER = "254726475130";

export const SUPPORT_PHONE_DISPLAY = "+254 726 475130";
export const SUPPORT_EMAIL = "hello@westquest.co.ke";

export const STORE_ADDRESS = "Nairobi CBD, Kenya";
export const STORE_MAPS_URL = "https://www.google.com/maps?q=Nairobi+CBD,+Kenya";
export const STORE_HOURS = "Mon–Sat, 9am – 6pm";
export const STORE_HOURS_NOTE = "Closed Sundays & public holidays";
/** Approximate — update to the exact pin before launch. */
export const STORE_GEO = { lat: -1.2841, lng: 36.8256 };

export const FACEBOOK_URL = "https://www.facebook.com/westquestlimited";
export const INSTAGRAM_URL = "https://www.instagram.com/westquestlimited";
export const TIKTOK_URL = "https://www.tiktok.com/@westquestlimited";

/** All public social profiles, for footer icons + JSON-LD `sameAs`. */
export const SOCIAL_LINKS = [
  { name: "Facebook", href: FACEBOOK_URL },
  { name: "Instagram", href: INSTAGRAM_URL },
  { name: "TikTok", href: TIKTOK_URL },
] as const;

export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
