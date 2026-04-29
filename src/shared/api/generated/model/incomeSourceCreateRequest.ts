import type { CurrencyCode } from './currencyCode';
import type { Frequency } from './frequency';
import type { GrowthType } from './growthType';

/**
 * Request to create an income. id is optional and ignored by the current backend; server generates id/timestamps.
 */
export interface IncomeSourceCreateRequest {
  id?: string;
  name: string;
  /** @minimum 0 */
  amount: number;
  currency: CurrencyCode;
  frequency: Frequency;
  growthType: GrowthType;
  /**
     * @minimum 0
     * @maximum 100
     */
  growthPct: number;
  startDate: string;
  /** @nullable */
  endDate?: string | null;
}
