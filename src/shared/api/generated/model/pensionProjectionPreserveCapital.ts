import type { PensionProjectionPreserveCapitalRequiredCapitalStatus } from './pensionProjectionPreserveCapitalRequiredCapitalStatus';

export type PensionProjectionPreserveCapital = {
  annualSpendableAtRetirement: number;
  annualSpendableCurrentPrices: number;
  monthlySpendableCurrentPrices: number;
  /** @nullable */
  requiredCapitalAtRetirement: number | null;
  requiredCapitalStatus: PensionProjectionPreserveCapitalRequiredCapitalStatus;
};
