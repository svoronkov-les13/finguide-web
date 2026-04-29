import type { CurrencyCode } from './currencyCode';
import type { YearRatePoint } from './yearRatePoint';

export interface ModelAssumptions {
  startYear: number;
  /** @nullable */
  projectionEndYear?: number | null;
  /**
     * @minimum 1
     * @maximum 80
     * @nullable
     */
  horizonYears?: number | null;
  /** @nullable */
  birthYear?: number | null;
  /**
     * @minimum 1
     * @maximum 12
     */
  monthsPerYear: number;
  currency: CurrencyCode;
  initialCapital?: number;
  /** Nominal annual return in percent points. Excel sample: 6. */
  investmentReturnPct: number;
  inflationSchedule: YearRatePoint[];
  /**
     * Optional import/source marker, e.g. uploaded Excel model checksum.
     * @nullable
     */
  sourceModel?: string | null;
}
