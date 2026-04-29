
export type ExpenseItemCreateRequestBudgetClass = typeof ExpenseItemCreateRequestBudgetClass[keyof typeof ExpenseItemCreateRequestBudgetClass];


export const ExpenseItemCreateRequestBudgetClass = {
  needs: 'needs',
  wants: 'wants',
  savings: 'savings',
} as const;
