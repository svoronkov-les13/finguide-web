import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { financialPlanClient } from "@/api/financialPlanClient";
import type { Cashflow, EditablePlanPatch, Goal, ScenarioId, TrackerEntry } from "@/types/finance";

export const planQueryKey = ["financial-plan"] as const;

export function usePlanQuery() {
  return useQuery({
    queryKey: planQueryKey,
    queryFn: () => financialPlanClient.getPlan(),
    staleTime: 30_000,
  });
}

export function useSetScenarioMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: ScenarioId) => financialPlanClient.setScenario(id),
    onSuccess: (plan) => queryClient.setQueryData(planQueryKey, plan),
  });
}

export function useUpdateSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: EditablePlanPatch) => financialPlanClient.updateSettings(patch),
    onSuccess: (plan) => queryClient.setQueryData(planQueryKey, plan),
  });
}

export function useUpdateCashflowMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Cashflow> }) => financialPlanClient.updateCashflow(id, patch),
    onSuccess: (plan) => queryClient.setQueryData(planQueryKey, plan),
  });
}

export function useAddCashflowMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<Cashflow, "id">) => financialPlanClient.addCashflow(input),
    onSuccess: (plan) => queryClient.setQueryData(planQueryKey, plan),
  });
}

export function useDuplicateCashflowMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financialPlanClient.duplicateCashflow(id),
    onSuccess: (plan) => queryClient.setQueryData(planQueryKey, plan),
  });
}

export function useDeleteCashflowMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financialPlanClient.deleteCashflow(id),
    onSuccess: (plan) => queryClient.setQueryData(planQueryKey, plan),
  });
}

export function useUpdateGoalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Goal> }) => financialPlanClient.updateGoal(id, patch),
    onSuccess: (plan) => queryClient.setQueryData(planQueryKey, plan),
  });
}

export function useAddGoalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<Goal, "id">) => financialPlanClient.addGoal(input),
    onSuccess: (plan) => queryClient.setQueryData(planQueryKey, plan),
  });
}

export function useDeleteGoalMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financialPlanClient.deleteGoal(id),
    onSuccess: (plan) => queryClient.setQueryData(planQueryKey, plan),
  });
}

export function useAddTrackerEntryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<TrackerEntry, "id">) => financialPlanClient.addTrackerEntry(input),
    onSuccess: (plan) => queryClient.setQueryData(planQueryKey, plan),
  });
}

export function useUpdateTrackerEntryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<TrackerEntry> }) => financialPlanClient.updateTrackerEntry(id, patch),
    onSuccess: (plan) => queryClient.setQueryData(planQueryKey, plan),
  });
}

export function useDeleteTrackerEntryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => financialPlanClient.deleteTrackerEntry(id),
    onSuccess: (plan) => queryClient.setQueryData(planQueryKey, plan),
  });
}

export function useResetPlanMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => financialPlanClient.resetPlan(),
    onSuccess: (plan) => queryClient.setQueryData(planQueryKey, plan),
  });
}

export function useSaveWhatIfScenarioMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { incomeGrowthDelta: number; expenseGrowthDelta: number; returnDelta: number }) => financialPlanClient.saveWhatIfScenario(input),
    onSuccess: (plan) => queryClient.setQueryData(planQueryKey, plan),
  });
}
