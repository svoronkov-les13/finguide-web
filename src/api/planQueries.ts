import { useMutation, useQuery, useQueryClient, QueryClient } from "@tanstack/react-query";
import { financialPlanClient } from "@/api/financialPlanClient";
import { useAuth } from "@/auth/AuthProvider";
import type { AuthSession } from "@/auth/oidc";
import type { Cashflow, EditablePlanPatch, FinancialPlan, Goal, MonthlyStatus, MonthlyTrackerEntry, PlanSummary, ScenarioId, TrackerEntry } from "@/types/finance";

export const planQueryKey = ["financial-plan"] as const;
export const anonymousPlanQueryKey = [...planQueryKey, "anonymous"] as const;
export const plansQueryKey = ["plans"] as const;

export function planQueryKeyForAuth(auth: { enabled: boolean; authenticated: boolean; session?: AuthSession }) {
  if (!auth.enabled) return anonymousPlanQueryKey;
  if (!auth.authenticated) return [...planQueryKey, "auth", "pending"] as const;

  const subject = auth.session?.profile?.sub ?? auth.session?.profile?.email ?? auth.session?.profile?.preferredUsername;
  return [...planQueryKey, "auth", subject ?? `session:${auth.session?.expiresAt ?? "unknown"}`] as const;
}

function useCurrentPlanQueryKey() {
  return planQueryKeyForAuth(useAuth());
}

export function updatePlanCacheAndRefresh(queryClient: QueryClient, queryKey: readonly unknown[], plan: FinancialPlan) {
  queryClient.setQueryData(queryKey, plan);
  queryClient.invalidateQueries({ queryKey });
}

export function usePlanQuery() {
  const auth = useAuth();
  const queryKey = planQueryKeyForAuth(auth);

  return useQuery({
    queryKey,
    queryFn: () => financialPlanClient.getPlan(),
    enabled: !auth.enabled || auth.authenticated,
    staleTime: 30_000,
  });
}

export function usePlansQuery() {
  const auth = useAuth();

  return useQuery({
    queryKey: plansQueryKey,
    queryFn: () => financialPlanClient.listPlans(),
    enabled: !auth.enabled || auth.authenticated,
    staleTime: 30_000,
  });
}

export function useSetScenarioMutation() {
  const queryClient = useQueryClient();
  const queryKey = useCurrentPlanQueryKey();
  return useMutation({
    mutationFn: (id: ScenarioId) => financialPlanClient.setScenario(id),
    onSuccess: (plan) => queryClient.setQueryData(queryKey, plan),
  });
}

export function useUpdateSettingsMutation() {
  const queryClient = useQueryClient();
  const queryKey = useCurrentPlanQueryKey();
  return useMutation({
    mutationFn: (patch: EditablePlanPatch) => financialPlanClient.updateSettings(patch),
    onSuccess: (plan) => queryClient.setQueryData(queryKey, plan),
  });
}

export function useUpdateCashflowMutation() {
  const queryClient = useQueryClient();
  const queryKey = useCurrentPlanQueryKey();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Cashflow> }) => financialPlanClient.updateCashflow(id, patch),
    onSuccess: (plan) => queryClient.setQueryData(queryKey, plan),
  });
}

export function useAddCashflowMutation() {
  const queryClient = useQueryClient();
  const queryKey = useCurrentPlanQueryKey();
  return useMutation({
    mutationFn: (input: Omit<Cashflow, "id">) => financialPlanClient.addCashflow(input),
    onSuccess: (plan) => queryClient.setQueryData(queryKey, plan),
  });
}

export function useDuplicateCashflowMutation() {
  const queryClient = useQueryClient();
  const queryKey = useCurrentPlanQueryKey();
  return useMutation({
    mutationFn: (id: string) => financialPlanClient.duplicateCashflow(id),
    onSuccess: (plan) => queryClient.setQueryData(queryKey, plan),
  });
}

export function useDeleteCashflowMutation() {
  const queryClient = useQueryClient();
  const queryKey = useCurrentPlanQueryKey();
  return useMutation({
    mutationFn: (id: string) => financialPlanClient.deleteCashflow(id),
    onSuccess: (plan) => queryClient.setQueryData(queryKey, plan),
  });
}

export function useUpdateGoalMutation() {
  const queryClient = useQueryClient();
  const queryKey = useCurrentPlanQueryKey();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Goal> }) => financialPlanClient.updateGoal(id, patch),
    onSuccess: (plan) => updatePlanCacheAndRefresh(queryClient, queryKey, plan),
  });
}

export function useAddGoalMutation() {
  const queryClient = useQueryClient();
  const queryKey = useCurrentPlanQueryKey();
  return useMutation({
    mutationFn: (input: Omit<Goal, "id">) => financialPlanClient.addGoal(input),
    onSuccess: (plan) => updatePlanCacheAndRefresh(queryClient, queryKey, plan),
  });
}

export function useDeleteGoalMutation() {
  const queryClient = useQueryClient();
  const queryKey = useCurrentPlanQueryKey();
  return useMutation({
    mutationFn: (id: string) => financialPlanClient.deleteGoal(id),
    onSuccess: (plan) => updatePlanCacheAndRefresh(queryClient, queryKey, plan),
  });
}

export function useReorderGoalsMutation() {
  const queryClient = useQueryClient();
  const queryKey = useCurrentPlanQueryKey();
  return useMutation({
    mutationFn: (goalIds: string[]) => financialPlanClient.reorderGoals(goalIds),
    onSuccess: (plan) => updatePlanCacheAndRefresh(queryClient, queryKey, plan),
  });
}

export function useAddTrackerEntryMutation() {
  const queryClient = useQueryClient();
  const queryKey = useCurrentPlanQueryKey();
  return useMutation({
    mutationFn: (input: Omit<TrackerEntry, "id">) => financialPlanClient.addTrackerEntry(input),
    onSuccess: (plan) => queryClient.setQueryData(queryKey, plan),
  });
}

export function useUpdateTrackerEntryMutation() {
  const queryClient = useQueryClient();
  const queryKey = useCurrentPlanQueryKey();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<TrackerEntry> }) => financialPlanClient.updateTrackerEntry(id, patch),
    onSuccess: (plan) => queryClient.setQueryData(queryKey, plan),
  });
}

export function useDeleteTrackerEntryMutation() {
  const queryClient = useQueryClient();
  const queryKey = useCurrentPlanQueryKey();
  return useMutation({
    mutationFn: (id: string) => financialPlanClient.deleteTrackerEntry(id),
    onSuccess: (plan) => queryClient.setQueryData(queryKey, plan),
  });
}

export function useResetPlanMutation() {
  const queryClient = useQueryClient();
  const queryKey = useCurrentPlanQueryKey();
  return useMutation({
    mutationFn: () => financialPlanClient.resetPlan(),
    onSuccess: (plan) => queryClient.setQueryData(queryKey, plan),
  });
}

export function useSaveWhatIfScenarioMutation() {
  const queryClient = useQueryClient();
  const queryKey = useCurrentPlanQueryKey();
  return useMutation({
    mutationFn: (input: {
      incomeGrowthDelta: number;
      expenseGrowthDelta: number;
      returnDelta: number;
      inflationDelta?: number;
      retirementAgeShift?: number;
      goalsCostDelta?: number;
      description?: string;
    }) => financialPlanClient.saveWhatIfScenario(input),
    onSuccess: (plan) => queryClient.setQueryData(queryKey, plan),
  });
}



// ─── Monthly Tracker ──────────────────────────────────────────────────────────

export const monthlyTrackerQueryKey = ["monthly-tracker"] as const;

export function monthlyTrackerQueryKeyForPlan(planId: string | null | undefined) {
  return [...monthlyTrackerQueryKey, planId ?? "pending"] as const;
}

export function updatePlanManagementCaches(queryClient: QueryClient, queryKey: readonly unknown[], currentPlan?: PlanSummary) {
  if (currentPlan) {
    const existingPlans = queryClient.getQueryData<PlanSummary[]>(plansQueryKey) ?? [];
    const hasPlan = existingPlans.some((plan) => plan.id === currentPlan.id);
    const nextPlans = (hasPlan ? existingPlans : [...existingPlans, currentPlan])
      .map((plan) => ({ ...plan, current: plan.id === currentPlan.id }));
    queryClient.setQueryData(plansQueryKey, nextPlans);
  }

  queryClient.invalidateQueries({ queryKey });
  queryClient.invalidateQueries({ queryKey: plansQueryKey });
  queryClient.invalidateQueries({ queryKey: monthlyTrackerQueryKey });
}

export function updateMonthlyTrackerCache(queryClient: QueryClient, queryKey: readonly unknown[], planId: string, data: MonthlyTrackerEntry[]) {
  // Merge: replace entries for the affected year(s) while keeping others intact
  const trackerQueryKey = monthlyTrackerQueryKeyForPlan(planId);
  const existing = queryClient.getQueryData<MonthlyTrackerEntry[]>(trackerQueryKey) ?? [];
  const incomingYears = new Set(data.map((e) => e.month.split("-")[0]));
  const kept = existing.filter((e) => !incomingYears.has(e.month.split("-")[0]));
  queryClient.setQueryData(trackerQueryKey, [...kept, ...data]);
  queryClient.invalidateQueries({ queryKey });
}

export function useCreatePlanMutation() {
  const queryClient = useQueryClient();
  const queryKey = useCurrentPlanQueryKey();
  return useMutation({
    mutationFn: (name: string) => financialPlanClient.createPlan(name),
    onSuccess: (plan) => updatePlanManagementCaches(queryClient, queryKey, plan),
  });
}

export function useCopyPlanMutation() {
  const queryClient = useQueryClient();
  const queryKey = useCurrentPlanQueryKey();
  return useMutation({
    mutationFn: ({ planId, name }: { planId: string; name: string }) => financialPlanClient.copyPlan(planId, name),
    onSuccess: (plan) => updatePlanManagementCaches(queryClient, queryKey, plan),
  });
}

export function useSwitchPlanMutation() {
  const queryClient = useQueryClient();
  const queryKey = useCurrentPlanQueryKey();
  return useMutation({
    mutationFn: (planId: string) => financialPlanClient.switchPlan(planId),
    onSuccess: (plan) => updatePlanManagementCaches(queryClient, queryKey, plan),
  });
}

export function useMonthlyTrackerQuery() {
  const auth = useAuth();
  // Wait for plan to load so currentPlanId() returns the real UUID, not "plan_demo"
  const { data: plan } = usePlanQuery();
  const planId = plan?.planId;
  return useQuery({
    queryKey: monthlyTrackerQueryKeyForPlan(planId),
    queryFn: async () => {
      try {
        return await financialPlanClient.getMonthlyTracker(planId!);
      } catch {
        // Anonymous demo plan is read-only — returns empty list for unauthenticated sessions
        return [] as MonthlyTrackerEntry[];
      }
    },
    enabled: (!auth.enabled || auth.authenticated) && !!planId,
    staleTime: 30_000,
    retry: false,
  });
}

export function useSaveMonthlyTrackerMutation() {
  const queryClient = useQueryClient();
  const queryKey = useCurrentPlanQueryKey();
  return useMutation({
    mutationFn: ({ planId, month, status, amount, note }: { planId: string; month: string; status: MonthlyStatus; amount?: number | null; note?: string | null }) =>
      financialPlanClient.saveMonthlyTrackerEntry(planId, month, status, amount, note),
    onSuccess: (data, variables) => updateMonthlyTrackerCache(queryClient, queryKey, variables.planId, data),
  });
}

/**
 * Fetches tracker data for a specific year and merges it into the shared cache.
 * Use in TrackingPage to load data when the user switches the viewed year.
 */
export function useMonthlyTrackerForYear(year: number) {
  const auth = useAuth();
  const { data: plan } = usePlanQuery();
  const queryClient = useQueryClient();
  const planId = plan?.planId;
  const trackerQueryKey = monthlyTrackerQueryKeyForPlan(planId);

  return useQuery({
    queryKey: [...trackerQueryKey, "year", year] as const,
    queryFn: async () => {
      try {
        const data = await financialPlanClient.getMonthlyTracker(planId!, year);
        // Merge into the shared cache so the grid picks it up
        const existing = queryClient.getQueryData<MonthlyTrackerEntry[]>(trackerQueryKey) ?? [];
        const yearStr = String(year);
        const kept = existing.filter((e) => e.month.split("-")[0] !== yearStr);
        queryClient.setQueryData(trackerQueryKey, [...kept, ...data]);
        return data;
      } catch {
        return [] as MonthlyTrackerEntry[];
      }
    },
    enabled: (!auth.enabled || auth.authenticated) && !!planId,
    staleTime: 30_000,
    retry: false,
  });
}
