import type { BudgetSettings } from './budgetSettings';
import type { Contribution } from './contribution';
import type { ExpenseItem } from './expenseItem';
import type { Goal } from './goal';
import type { IncomeSource } from './incomeSource';
import type { ModelAssumptions } from './modelAssumptions';
import type { PensionSettings } from './pensionSettings';
import type { UserProfile } from './userProfile';

export interface PlanState {
  id: string;
  profile: UserProfile;
  pension: PensionSettings;
  incomes: IncomeSource[];
  expenses: ExpenseItem[];
  goals: Goal[];
  contributions: Contribution[];
  budget: BudgetSettings;
  updatedAt?: string;
  modelAssumptions?: ModelAssumptions;
}
