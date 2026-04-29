
export type ImportRequestType = typeof ImportRequestType[keyof typeof ImportRequestType];


export const ImportRequestType = {
  incomes: 'incomes',
  expenses: 'expenses',
  goals: 'goals',
  full_plan: 'full_plan',
  excel_model: 'excel_model',
} as const;
