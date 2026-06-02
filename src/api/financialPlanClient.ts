import { backendPlanClient } from "@/api/backendPlanClient";
import { mockApi } from "@/api/mockApi";
import type { Cashflow, EditablePlanPatch, Goal, MonthlyStatus, ScenarioId, TrackerEntry } from "@/types/finance";

const useMockApi = import.meta.env.VITE_FINGUIDE_USE_MOCK === "true";
const allowDevMockFallback = import.meta.env.DEV && import.meta.env.VITE_FINGUIDE_DEV_MOCK_FALLBACK !== "false";

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

function activeClient() {
  return devMockFallbackActive ? mockApi : backendPlanClient;
}

const backendFirstClient = {
  getPlan: getPlanWithDevFallback,
  listPlans: () => activeClient().listPlans(),
  createPlan: (name: string) => activeClient().createPlan(name),
  copyPlan: (planId: string, name: string) => activeClient().copyPlan(planId, name),
  switchPlan: (planId: string) => activeClient().switchPlan(planId),
  setScenario: (id: ScenarioId) => activeClient().setScenario(id),
  updateSettings: (patch: EditablePlanPatch) => activeClient().updateSettings(patch),
  updateCashflow: (id: string, patch: Partial<Cashflow>) => activeClient().updateCashflow(id, patch),
  addCashflow: (input: Omit<Cashflow, "id">) => activeClient().addCashflow(input),
  duplicateCashflow: (id: string) => activeClient().duplicateCashflow(id),
  deleteCashflow: (id: string) => activeClient().deleteCashflow(id),
  updateGoal: (id: string, patch: Partial<Goal>) => activeClient().updateGoal(id, patch),
  addGoal: (input: Omit<Goal, "id">) => activeClient().addGoal(input),
  deleteGoal: (id: string) => activeClient().deleteGoal(id),
  reorderGoals: (goalIds: string[]) => activeClient().reorderGoals(goalIds),
  addTrackerEntry: (input: Omit<TrackerEntry, "id">) => activeClient().addTrackerEntry(input),
  updateTrackerEntry: (id: string, patch: Partial<TrackerEntry>) => activeClient().updateTrackerEntry(id, patch),
  deleteTrackerEntry: (id: string) => activeClient().deleteTrackerEntry(id),
  resetPlan: () => activeClient().resetPlan(),
  saveWhatIfScenario: (input: Parameters<typeof backendPlanClient.saveWhatIfScenario>[0]) =>
    activeClient().saveWhatIfScenario(input),
  // Monthly tracker — always hit backend
  getMonthlyTracker: (planId: string, year?: number) => backendPlanClient.getMonthlyTracker(planId, year),
  saveMonthlyTrackerEntry: (planId: string, month: string, status: MonthlyStatus, amount?: number | null, note?: string | null) =>
    backendPlanClient.saveMonthlyTrackerEntry(planId, month, status, amount, note),
};

export type FinancialPlanClient = typeof backendFirstClient;

export const financialPlanClient: FinancialPlanClient = useMockApi ? (mockApi as unknown as FinancialPlanClient) : backendFirstClient;
