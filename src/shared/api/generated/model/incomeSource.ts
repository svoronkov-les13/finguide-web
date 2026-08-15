import type { CurrencyCode } from './currencyCode';
import type { Frequency } from './frequency';
import type { GrowthType } from './growthType';
import type { YearRatePoint } from './yearRatePoint';

export interface IncomeSource {
  id: string;
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
  createdAt?: string;
  updatedAt?: string;
  /**
     * Derived/imported active start year; startDate remains canonical for day precision.
     * @nullable
     */
  startYear?: number | null;
  /**
     * Derived/imported active end year; endDate remains canonical for day precision.
     * @nullable
     */
  endYear?: number | null;
  /** Optional per-year growth rates from the Excel model. Overrides growthPct for listed years. */
  growthSchedule?: YearRatePoint[];
}
