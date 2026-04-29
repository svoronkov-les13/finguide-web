
export type PostExportBodyScope = typeof PostExportBodyScope[keyof typeof PostExportBodyScope];


export const PostExportBodyScope = {
  full_plan: 'full_plan',
  incomes: 'incomes',
  expenses: 'expenses',
  goals: 'goals',
  summary: 'summary',
} as const;
