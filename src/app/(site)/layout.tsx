import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { PromoPopup } from "@/components/layout/PromoPopup";
import { AccountProvider } from "@/context/AccountContext";
import { CartProvider } from "@/context/CartContext";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <AccountProvider>
      <CartProvider>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>
        <Navbar />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <WhatsAppButton />
        <PromoPopup />
      </CartProvider>
    </AccountProvider>
  );
}
