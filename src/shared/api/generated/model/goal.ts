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
