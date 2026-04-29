import type { CurrencyCode } from './currencyCode';
import type { PensionProjection } from './pensionProjection';
import type { PensionSettingsWithdrawalStrategy } from './pensionSettingsWithdrawalStrategy';

export interface PensionSettings {
  /**
     * @minimum 16
     * @maximum 100
     */
  currentAge: number;
  /**
     * @minimum 40
     * @maximum 80
     */
  retirementAge: number;
  /** @minimum 0 */
  monthlyExpenses: number;
  currency: CurrencyCode;
  /**
     * @minimum 0
     * @maximum 30
     */
  expectedReturnPct: number;
  /**
     * @minimum 0
     * @maximum 30
     */
  inflationPct: number;
  /** UI scenarios: preserve / spend */
  withdrawalStrategy: PensionSettingsWithdrawalStrategy;
  statePensionEnabled: boolean;
  /** @minimum 0 */
  statePensionMonthly: number;
  /**
     * Excel model row: desired retirement spending in current prices.
     * @nullable
     */
  desiredMonthlyExpensesCurrentPrices?: number | null;
  projection?: PensionProjection;
}
