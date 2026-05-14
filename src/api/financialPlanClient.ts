import { backendPlanClient } from "@/api/backendPlanClient";
import { mockApi } from "@/api/mockApi";
import type { Cashflow, EditablePlanPatch, Goal, ScenarioId, TrackerEntry } from "@/types/finance";

const useMockApi = import.meta.env.VITE_FINGUIDE_USE_MOCK === "true";
const allowDevMockFallback = import.meta.env.DEV && import.meta.env.VITE_FINGUIDE_DEV_MOCK_FALLBACK !== "false";

export type FinancialPlanClient = typeof mockApi;

let devMockFallbackActive = false;

function activateDevMockFallback(error: unknown) {
  devMockFallbackActive = true;

  if (typeof console !== "undefined") {
    console.warn(
      "[FinGuide] Backend plan API is unavailable in dev mode. Switched this session to the local mock plan.",
      error,
    );
  }
}

async function getPlanWithDevFallback() {
  if (devMockFallbackActive) return mockApi.getPlan();

  try {
    return await backendPlanClient.getPlan();
  } catch (error) {
    if (!allowDevMockFallback) throw error;
    activateDevMockFallback(error);
    return mockApi.getPlan();
  }
}

function activeClient(): FinancialPlanClient {
  return devMockFallbackActive ? mockApi : backendPlanClient;
}

const backendFirstClient: FinancialPlanClient = {
  getPlan: getPlanWithDevFallback,
  setScenario: (id: ScenarioId) => activeClient().setScenario(id),
  updateSettings: (patch: EditablePlanPatch) => activeClient().updateSettings(patch),
  updateCashflow: (id: string, patch: Partial<Cashflow>) => activeClient().updateCashflow(id, patch),
  addCashflow: (input: Omit<Cashflow, "id">) => activeClient().addCashflow(input),
  duplicateCashflow: (id: string) => activeClient().duplicateCashflow(id),
  deleteCashflow: (id: string) => activeClient().deleteCashflow(id),
  updateGoal: (id: string, patch: Partial<Goal>) => activeClient().updateGoal(id, patch),
  addGoal: (input: Omit<Goal, "id">) => activeClient().addGoal(input),
  deleteGoal: (id: string) => activeClient().deleteGoal(id),
  addTrackerEntry: (input: Omit<TrackerEntry, "id">) => activeClient().addTrackerEntry(input),
  updateTrackerEntry: (id: string, patch: Partial<TrackerEntry>) => activeClient().updateTrackerEntry(id, patch),
  deleteTrackerEntry: (id: string) => activeClient().deleteTrackerEntry(id),
  resetPlan: () => activeClient().resetPlan(),
  saveWhatIfScenario: (input) => activeClient().saveWhatIfScenario(input),
};

export const financialPlanClient: FinancialPlanClient = useMockApi ? mockApi : backendFirstClient;
