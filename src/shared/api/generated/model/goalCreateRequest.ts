import type { CurrencyCode } from './currencyCode';
import type { GoalCreateRequestType } from './goalCreateRequestType';
import type { GrowthType } from './growthType';

/**
 * Request to create a goal. id is optional and ignored by the current backend; server generates id/timestamps.
 */
export interface GoalCreateRequest {
  id?: string;
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
  type: GoalCreateRequestType;
  growthType: GrowthType;
  /**
     * @minimum 0
     * @maximum 100
     */
  growthPct: number;
  indexLabel?: string;
  /** @minimum 1 */
  priority: number;
}
