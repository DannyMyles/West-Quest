import { redirect } from "next/navigation";

/** Old single-device "apply" links now go to the product, where the plan is added to the cart. */
export default async function ApplyPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const { product } = await searchParams;
  const slug = typeof product === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(product) ? product : null;
  redirect(slug ? `/catalogue/${slug}` : "/catalogue");
}
