import type { CurrencyCode } from './currencyCode';
import type { Frequency } from './frequency';
import type { GoalType } from './goalType';
import type { GrowthType } from './growthType';
import type { YearRatePoint } from './yearRatePoint';

export interface Goal {
  id: string;
  name: string;
  icon?: string;
  /** @minimum 0 */
  currentCost: number;
  /**
     * denormalized current saved amount; server can also derive it from contributions
     * @minimum 0
     */
  savedAmount: number;
  currency: CurrencyCode;
  /** @minimum 2024 */
  targetYear: number;
  /** Month within targetYear (1-12). Defaults to December when omitted. */
  targetMonth?: number;
  type: GoalType;
  growthType: GrowthType;
  /**
     * @minimum 0
     * @maximum 100
     */
  growthPct: number;
  indexLabel?: string;
  /** @minimum 1 */
  priority: number;
  /** Cost inflated to the goal target year for projected allocation. */
  projectedTargetCost?: number;
  /** Forecast amount allocated from income minus expenses by goal priority. */
  projectedSavedAmount?: number;
  /** Forecast progress toward projectedTargetCost, capped at 100. */
  projectedProgressPct?: number;
  /** Whether projectedSavedAmount reaches projectedTargetCost. */
  projectedReachable?: boolean;
  /** First forecast year when the goal is fully allocated. */
  projectedCompletionYear?: number | null;
  createdAt?: string;
  updatedAt?: string;
  /**
     * For recurring goal-spending lines from the Excel model.
     * @nullable
     */
  plannedAmount?: number | null;
  frequency?: Frequency;
  /** @nullable */
  startDate?: string | null;
  /** @nullable */
  endDate?: string | null;
  /** @nullable */
  startYear?: number | null;
  /** @nullable */
  endYear?: number | null;
  growthSchedule?: YearRatePoint[];
}
