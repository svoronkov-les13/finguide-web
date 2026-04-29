import type { HealthScoreItemsItem } from './healthScoreItemsItem';

export interface HealthScore {
  /**
     * @minimum 0
     * @maximum 100
     */
  score: number;
  items: HealthScoreItemsItem[];
}
