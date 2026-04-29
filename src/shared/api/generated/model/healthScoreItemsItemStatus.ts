
export type HealthScoreItemsItemStatus = typeof HealthScoreItemsItemStatus[keyof typeof HealthScoreItemsItemStatus];


export const HealthScoreItemsItemStatus = {
  good: 'good',
  warning: 'warning',
  bad: 'bad',
} as const;
