import type { PaymentPlan, TermMonths } from "./types";

export const TERM_OPTIONS: TermMonths[] = [6, 9, 12];

/** Approximate calendar days per term, used only to show an estimated total
 *  cost — the catalogue gives deposit + daily rate directly, not a total. */
const APPROX_DAYS_PER_TERM: Record<TermMonths, number> = { 6: 182, 9: 273, 12: 365 };

export function dailyForTerm(plan: PaymentPlan, term: TermMonths): number {
  return term === 6 ? plan.daily6 : term === 9 ? plan.daily9 : plan.daily12;
}

/** Deposit + (daily rate × approximate days in the term). Always shown in the
 *  UI as an estimate, not a contractual figure. */
export function estimateTotalCost(plan: PaymentPlan, term: TermMonths): number {
  return plan.depositAmount + dailyForTerm(plan, term) * APPROX_DAYS_PER_TERM[term];
}

/** Cheapest daily rate across all terms — used for the "From KSh X/day" teaser
 *  on product cards, so cards stay scannable without the full calculator. */
export function cheapestDaily(plan: PaymentPlan): number {
  return Math.min(plan.daily6, plan.daily9, plan.daily12);
}
