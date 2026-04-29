
export interface GoalReorderRequest {
  /** All current goal ids in the desired waterfall priority order, each exactly once. */
  goalIds: string[];
}
