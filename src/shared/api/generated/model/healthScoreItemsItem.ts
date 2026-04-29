import type { HealthScoreItemsItemStatus } from './healthScoreItemsItemStatus';

export type HealthScoreItemsItem = {
  key?: string;
  label?: string;
  value?: number;
  status?: HealthScoreItemsItemStatus;
  hint?: string;
};
