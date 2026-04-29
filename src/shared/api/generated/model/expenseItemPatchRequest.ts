import type { CurrencyCode } from './currencyCode';
import type { ExpenseItemPatchRequestBudgetClass } from './expenseItemPatchRequestBudgetClass';
import type { Frequency } from './frequency';
import type { GrowthType } from './growthType';

/**
 * Partial request to update an expense; omitted fields stay unchanged. Omitted fields keep current values; explicit null for nullable fields is treated as unchanged in the current H2 implementation.
 */
export interface ExpenseItemPatchRequest {
  name?: string;
  /** @minimum 0 */
  amount?: number;
  currency?: CurrencyCode;
  frequency?: Frequency;
  growthType?: GrowthType;
  /**
     * @minimum 0
     * @maximum 100
     */
  growthPct?: number;
  growthLabel?: string;
  budgetClass?: ExpenseItemPatchRequestBudgetClass;
  startDate?: string;
  /** @nullable */
  endDate?: string | null;
}
