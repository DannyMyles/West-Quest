import type { Metadata } from "next";
import { AccountView } from "./AccountView";

export const metadata: Metadata = {
  title: "My orders",
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return <AccountView />;
}
