import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginView } from "./LoginView";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginView />
    </Suspense>
  );
}
