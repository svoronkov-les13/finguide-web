
export type GoalType = typeof GoalType[keyof typeof GoalType];


export const GoalType = {
  one_time: 'one_time',
  recurring: 'recurring',
} as const;
