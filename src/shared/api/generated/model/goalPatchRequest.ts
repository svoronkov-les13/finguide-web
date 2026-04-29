import type { CurrencyCode } from './currencyCode';
import type { GoalPatchRequestType } from './goalPatchRequestType';
import type { GrowthType } from './growthType';

/**
 * Partial request to update a goal; omitted fields stay unchanged. Omitted fields keep current values; explicit null for nullable fields is treated as unchanged in the current H2 implementation.
 */
export interface GoalPatchRequest {
  name?: string;
  icon?: string;
  /** @minimum 0 */
  currentCost?: number;
  /**
     * denormalized current saved amount; server can also derive it from contributions
     * @minimum 0
     */
  savedAmount?: number;
  currency?: CurrencyCode;
  /** @minimum 2024 */
  targetYear?: number;
  type?: GoalPatchRequestType;
  growthType?: GrowthType;
  /**
     * @minimum 0
     * @maximum 100
     */
  growthPct?: number;
  indexLabel?: string;
  /** @minimum 1 */
  priority?: number;
}
