import { mockApi } from "@/api/mockApi";

export type FinancialPlanClient = typeof mockApi;

export const financialPlanClient: FinancialPlanClient = mockApi;
