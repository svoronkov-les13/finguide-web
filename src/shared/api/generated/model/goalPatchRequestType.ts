
export type GoalPatchRequestType = typeof GoalPatchRequestType[keyof typeof GoalPatchRequestType];


export const GoalPatchRequestType = {
  one_time: 'one_time',
  recurring: 'recurring',
} as const;
