import { api } from "./client";
import type { PaymentPlan, PaymentTier } from "@/lib/types";

export interface PaymentPlanInput {
  depositPercent: number;
  depositAmount: number;
  daily6: number;
  daily9: number;
  daily12: number;
}

/** Creates or replaces a product's plan for the given tier. */
export const adminUpsertPlan = (productId: number, tier: PaymentTier, input: PaymentPlanInput) =>
  api<{ paymentPlans: PaymentPlan[] }>(`/admin/products/${productId}/plans/${tier}`, { method: "PUT", json: input }).then(
    (r) => r.paymentPlans
  );

/** Stops offering a tier (e.g. removing VIP from a product). */
export const adminRemovePlan = (productId: number, tier: PaymentTier) =>
  api<{ paymentPlans: PaymentPlan[] }>(`/admin/products/${productId}/plans/${tier}`, { method: "DELETE" }).then(
    (r) => r.paymentPlans
  );
