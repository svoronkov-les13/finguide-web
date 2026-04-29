
export type GoalCreateRequestType = typeof GoalCreateRequestType[keyof typeof GoalCreateRequestType];


export const GoalCreateRequestType = {
  one_time: 'one_time',
  recurring: 'recurring',
} as const;
