import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { financialPlanClient } from "@/api/financialPlanClient";
import { useAuth } from "@/auth/AuthProvider";
import type { AuthSession } from "@/auth/oidc";
import type { Cashflow, Contribution, EditablePlanPatch, Goal, MonthlyStatus, MonthlyTrackerEntry, ScenarioId, TrackerEntry } from "@/types/finance";

export const planQueryKey = ["financial-plan"] as const;
export const anonymousPlanQueryKey = [...planQueryKey, "anonymous"] as const;

export function planQueryKeyForAuth(auth: { enabled: boolean; authenticated: boolean; session?: AuthSession }) {
  if (!auth.enabled) return anonymousPlanQueryKey;
  if (!auth.authenticated) return [...planQueryKey, "auth", "pending"] as const;

  const subject = auth.session?.profile?.sub ?? auth.session?.profile?.email ?? auth.session?.profile?.preferredUsername;
  return [...planQueryKey, "auth", subject ?? `session:${auth.session?.expiresAt ?? "unknown"}`] as const;
}

function useCurrentPlanQueryKey() {
  return planQueryKeyForAuth(useAuth());
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
    onSuccess: (plan) => queryClient.setQueryData(queryKey, plan),
  });
}

export function useAddGoalMutation() {
  const queryClient = useQueryClient();
  const queryKey = useCurrentPlanQueryKey();
  return useMutation({
    mutationFn: (input: Omit<Goal, "id">) => financialPlanClient.addGoal(input),
    onSuccess: (plan) => queryClient.setQueryData(queryKey, plan),
  });
}

export function useDeleteGoalMutation() {
  const queryClient = useQueryClient();
  const queryKey = useCurrentPlanQueryKey();
  return useMutation({
    mutationFn: (id: string) => financialPlanClient.deleteGoal(id),
    onSuccess: (plan) => queryClient.setQueryData(queryKey, plan),
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

// ─── Contributions ────────────────────────────────────────────────────────────

export const contributionsQueryKey = ["contributions"] as const;

type CacheWriter = Pick<QueryClient, "setQueryData" | "invalidateQueries">;

export function updateSavingsCaches(queryClient: CacheWriter, queryKey: readonly unknown[], contributions: Contribution[]) {
  queryClient.setQueryData(contributionsQueryKey, contributions);
  queryClient.invalidateQueries({ queryKey });
}

export function useContributionsQuery() {
  const auth = useAuth();
  // Wait for plan to load so currentPlanId() returns the real UUID, not "plan_demo"
  const { data: plan } = usePlanQuery();
  return useQuery({
    queryKey: contributionsQueryKey,
    queryFn: () => financialPlanClient.getContributions(plan!.planId!),
    enabled: (!auth.enabled || auth.authenticated) && !!plan?.planId,
    staleTime: 30_000,
  });
}

export function useAddContributionMutation() {
  const queryClient = useQueryClient();
  const queryKey = useCurrentPlanQueryKey();
  return useMutation({
    mutationFn: ({ planId, ...input }: { planId: string } & Omit<Contribution, "id">) =>
      financialPlanClient.addContribution(planId, input),
    onSuccess: (data) => updateSavingsCaches(queryClient, queryKey, data),
  });
}

export function useUpdateContributionMutation() {
  const queryClient = useQueryClient();
  const queryKey = useCurrentPlanQueryKey();
  return useMutation({
    mutationFn: ({ planId, id, patch }: { planId: string; id: string; patch: Partial<Omit<Contribution, "id">> }) =>
      financialPlanClient.updateContribution(planId, id, patch),
    onSuccess: (data) => updateSavingsCaches(queryClient, queryKey, data),
  });
}

export function useDeleteContributionMutation() {
  const queryClient = useQueryClient();
  const queryKey = useCurrentPlanQueryKey();
  return useMutation({
    mutationFn: ({ planId, id }: { planId: string; id: string }) =>
      financialPlanClient.deleteContribution(planId, id),
    onSuccess: (data) => updateSavingsCaches(queryClient, queryKey, data),
  });
}

// ─── Monthly Tracker ──────────────────────────────────────────────────────────

export const monthlyTrackerQueryKey = ["monthly-tracker"] as const;

export function updateMonthlyTrackerCache(queryClient: Pick<QueryClient, "setQueryData">, data: MonthlyTrackerEntry[]) {
  queryClient.setQueryData(monthlyTrackerQueryKey, data);
}

export function useMonthlyTrackerQuery() {
  const auth = useAuth();
  // Wait for plan to load so currentPlanId() returns the real UUID, not "plan_demo"
  const { data: plan } = usePlanQuery();
  return useQuery({
    queryKey: monthlyTrackerQueryKey,
    queryFn: () => financialPlanClient.getMonthlyTracker(plan!.planId!),
    enabled: (!auth.enabled || auth.authenticated) && !!plan?.planId,
    staleTime: 30_000,
  });
}

export function useSaveMonthlyTrackerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ planId, month, status, amount, note }: { planId: string; month: string; status: MonthlyStatus; amount?: number | null; note?: string | null }) =>
      financialPlanClient.saveMonthlyTrackerEntry(planId, month, status, amount, note),
    onSuccess: (data) => updateMonthlyTrackerCache(queryClient, data),
  });
}
