import { mockPlan } from "@/data/mock-plan";
import { calculateForecast } from "@/engine/calculateForecast";
import type { Cashflow, EditablePlanPatch, FinancialPlan, Goal, PlanSummary, ScenarioId, TrackerEntry } from "@/types/finance";

const STORAGE_KEY = "finguide.mock-plan.v1";

const wait = (ms = 220) => new Promise((resolve) => globalThis.setTimeout(resolve, ms));

function readStoredPlan() {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FinancialPlan) : null;
  } catch {
    return null;
  }
}

function writeStoredPlan(plan: FinancialPlan) {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(plan));
  } catch {
    // Storage can be unavailable in private mode or tests; the in-memory API still works.
  }
}

let db: FinancialPlan = readStoredPlan() ?? structuredClone(mockPlan);
let mockPlanCreatedAt = new Date().toISOString();

function commit(next: FinancialPlan, options: { preserveDashboardSnapshot?: boolean } = {}) {
  db = {
    ...next,
    dashboardSnapshot: options.preserveDashboardSnapshot ? next.dashboardSnapshot : undefined,
  };
  writeStoredPlan(db);
  return snapshot();
}

function snapshot() {
  return structuredClone({ ...db, forecast: calculateForecast(db) });
}

function assertExists<T>(item: T | undefined, message: string): T {
  if (!item) throw new Error(message);
  return item;
}

export const mockApi = {
  async getPlan() {
    await wait();
    return snapshot();
  },

  async listPlans(): Promise<PlanSummary[]> {
    await wait(80);
    return [mockPlanSummary()];
  },

  async createPlan(name: string): Promise<PlanSummary> {
    await wait(120);
    mockPlanCreatedAt = new Date().toISOString();
    db = {
      ...structuredClone(mockPlan),
      planId: `plan-${Date.now()}`,
      owner: { ...mockPlan.owner, planName: name },
      cashflows: [],
      goals: [],
      tracker: [],
      scenarios: structuredClone(mockPlan.scenarios),
    };
    writeStoredPlan(db);
    return mockPlanSummary();
  },

  async copyPlan(planId: string, name: string): Promise<PlanSummary> {
    await wait(120);
    void planId;
    mockPlanCreatedAt = new Date().toISOString();
    db = {
      ...structuredClone(db),
      planId: `plan-${Date.now()}`,
      owner: { ...db.owner, planName: name },
      goals: db.goals.map((goal) => ({ ...goal, saved: 0 })),
      tracker: [],
    };
    writeStoredPlan(db);
    return mockPlanSummary();
  },

  async switchPlan(planId: string): Promise<PlanSummary> {
    await wait(80);
    void planId;
    return mockPlanSummary();
  },

  async setScenario(id: ScenarioId) {
    await wait(120);
    return commit({ ...db, activeScenario: id }, { preserveDashboardSnapshot: id === "base" });
  },

  async updateSettings(patch: EditablePlanPatch) {
    await wait();
    return commit({ ...db, settings: { ...db.settings, ...patch } });
  },

  async updateCashflow(id: string, patch: Partial<Cashflow>) {
    await wait();
    assertExists(db.cashflows.find((item) => item.id === id), `Cashflow ${id} was not found`);
    return commit({
      ...db,
      cashflows: db.cashflows.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    });
  },

  async addCashflow(input: Omit<Cashflow, "id">) {
    await wait();
    return commit({
      ...db,
      cashflows: [{ ...input, id: `${input.type}-${Date.now()}` }, ...db.cashflows],
    });
  },

  async duplicateCashflow(id: string) {
    await wait();
    const source = assertExists(db.cashflows.find((item) => item.id === id), `Cashflow ${id} was not found`);
    const index = db.cashflows.findIndex((item) => item.id === id);
    const copy: Cashflow = {
      ...source,
      id: `${source.id}-copy-${Date.now()}`,
      name: `${source.name} (копия)`,
    };
    return commit({
      ...db,
      cashflows: [...db.cashflows.slice(0, index + 1), copy, ...db.cashflows.slice(index + 1)],
    });
  },

  async deleteCashflow(id: string) {
    await wait();
    assertExists(db.cashflows.find((item) => item.id === id), `Cashflow ${id} was not found`);
    return commit({
      ...db,
      cashflows: db.cashflows.filter((item) => item.id !== id),
    });
  },

  async updateGoal(id: string, patch: Partial<Goal>) {
    await wait();
    assertExists(db.goals.find((item) => item.id === id), `Goal ${id} was not found`);
    return commit({
      ...db,
      goals: db.goals.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    });
  },

  async addGoal(input: Omit<Goal, "id">) {
    await wait();
    return commit({
      ...db,
      goals: [{ ...input, id: `goal-${Date.now()}` }, ...db.goals],
    });
  },

  async deleteGoal(id: string) {
    await wait();
    assertExists(db.goals.find((item) => item.id === id), `Goal ${id} was not found`);
    return commit({
      ...db,
      goals: db.goals.filter((item) => item.id !== id),
    });
  },

  async reorderGoals(goalIds: string[]) {
    await wait();
    const sortedGoals = [...db.goals].sort((a, b) => {
      const idxA = goalIds.indexOf(a.id);
      const idxB = goalIds.indexOf(b.id);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
    const goalsWithPriority = sortedGoals.map((goal, index) => ({
      ...goal,
      priority: index + 1,
    }));
    return commit({
      ...db,
      goals: goalsWithPriority,
    });
  },

  async addTrackerEntry(input: Omit<TrackerEntry, "id">) {
    await wait();
    return commit(
      {
        ...db,
        tracker: [{ ...input, id: `tr-${Date.now()}` }, ...db.tracker],
      },
      { preserveDashboardSnapshot: true },
    );
  },

  async updateTrackerEntry(id: string, patch: Partial<TrackerEntry>) {
    await wait();
    assertExists(db.tracker.find((item) => item.id === id), `Tracker entry ${id} was not found`);
    return commit(
      {
        ...db,
        tracker: db.tracker.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      },
      { preserveDashboardSnapshot: true },
    );
  },

  async deleteTrackerEntry(id: string) {
    await wait();
    assertExists(db.tracker.find((item) => item.id === id), `Tracker entry ${id} was not found`);
    return commit(
      {
        ...db,
        tracker: db.tracker.filter((item) => item.id !== id),
      },
      { preserveDashboardSnapshot: true },
    );
  },

  async resetPlan() {
    await wait(160);
    db = structuredClone(mockPlan);
    writeStoredPlan(db);
    return snapshot();
  },

  async saveWhatIfScenario(input: {
    incomeGrowthDelta: number;
    expenseGrowthDelta: number;
    returnDelta: number;
    inflationDelta?: number;
    retirementAgeShift?: number;
    goalsCostDelta?: number;
    description?: string;
  }) {
    await wait(160);
    const hasWhatIf = db.scenarios.some((scenario) => scenario.id === "whatif");
    const whatIfScenario = {
      id: "whatif" as const,
      name: "Что если?",
      ...input,
    };

    return commit({
      ...db,
      activeScenario: "whatif",
      scenarios: hasWhatIf
        ? db.scenarios.map((scenario) => (scenario.id === "whatif" ? { ...scenario, ...whatIfScenario } : scenario))
        : [...db.scenarios, whatIfScenario],
    });
  },
};

function mockPlanSummary(): PlanSummary {
  const now = new Date().toISOString();
  return {
    id: db.planId ?? "plan_demo",
    name: db.owner.planName,
    current: true,
    createdAt: mockPlanCreatedAt,
    updatedAt: now,
  };
}
