import type { PensionProjectionPreserveCapital } from './pensionProjectionPreserveCapital';
import type { PensionProjectionSpendDown } from './pensionProjectionSpendDown';

export interface PensionProjection {
  currentAge: number;
  retirementAge: number;
  retirementYear: number;
  capitalAtRetirement: number;
  nominalReturnPct: number;
  averageInflationPct: number;
  realReturnPct: number;
  preserveCapital: PensionProjectionPreserveCapital;
  spendDown: PensionProjectionSpendDown;
}
