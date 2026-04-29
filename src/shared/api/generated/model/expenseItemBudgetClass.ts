
export type ExpenseItemBudgetClass = typeof ExpenseItemBudgetClass[keyof typeof ExpenseItemBudgetClass];


export const ExpenseItemBudgetClass = {
  needs: 'needs',
  wants: 'wants',
  savings: 'savings',
} as const;
