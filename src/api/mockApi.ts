import { mockPlan } from "@/data/mock-plan";
import { calculateForecast } from "@/engine/calculateForecast";
import type { Cashflow, EditablePlanPatch, FinancialPlan, Goal, ScenarioId, TrackerEntry } from "@/types/finance";

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

  async saveWhatIfScenario(input: { incomeGrowthDelta: number; expenseGrowthDelta: number; returnDelta: number }) {
    await wait(160);
    return commit({
      ...db,
      activeScenario: "whatif",
      scenarios: db.scenarios.map((scenario) => (scenario.id === "whatif" ? { ...scenario, ...input } : scenario)),
    });
  },
};
