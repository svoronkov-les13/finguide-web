
export interface BudgetEnvelope {
  id: string;
  name: string;
  /** @minimum 0 */
  limit: number;
  icon: string;
  color: string;
  readonly spent?: number;
  readonly remaining?: number;
  readonly pct?: number;
  readonly isOver?: boolean;
}
