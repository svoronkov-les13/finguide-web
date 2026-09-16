import { backendPlanClient } from "@/api/backendPlanClient";

/**
 * The single plan API client. The old mock client and its silent dev
 * fallback are gone on purpose: an unreachable backend must fail loudly
 * (surfaced by the error toast), never swap in fake data.
 */
export type FinancialPlanClient = typeof backendPlanClient;

export const financialPlanClient: FinancialPlanClient = backendPlanClient;
