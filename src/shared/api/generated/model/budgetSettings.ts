import type { BudgetEnvelope } from './budgetEnvelope';
import type { BudgetSettingsClassifications } from './budgetSettingsClassifications';
import type { BudgetSettingsMethod } from './budgetSettingsMethod';

export interface BudgetSettings {
  method: BudgetSettingsMethod;
  envelopes: BudgetEnvelope[];
  classifications: BudgetSettingsClassifications;
}
