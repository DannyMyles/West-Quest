import { redirect } from "next/navigation";

/** Tracking now lives in the signed-in account ("My orders"). */
export default function TrackPage() {
  redirect("/account");
}
