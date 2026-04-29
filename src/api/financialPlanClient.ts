import { backendPlanClient } from "@/api/backendPlanClient";
import { mockApi } from "@/api/mockApi";

const useMockApi = import.meta.env.VITE_FINGUIDE_USE_MOCK === "true";

export type FinancialPlanClient = typeof mockApi;

export const financialPlanClient: FinancialPlanClient = useMockApi ? mockApi : backendPlanClient;
