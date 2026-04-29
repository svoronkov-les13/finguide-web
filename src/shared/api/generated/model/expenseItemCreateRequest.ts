import type { CurrencyCode } from './currencyCode';
import type { ExpenseItemCreateRequestBudgetClass } from './expenseItemCreateRequestBudgetClass';
import type { Frequency } from './frequency';
import type { GrowthType } from './growthType';

/**
 * Request to create an expense. id is optional and ignored by the current backend; server generates id/timestamps.
 */
export interface ExpenseItemCreateRequest {
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
  growthLabel?: string;
  budgetClass?: ExpenseItemCreateRequestBudgetClass;
  startDate: string;
  /** @nullable */
  endDate?: string | null;
}
