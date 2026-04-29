import type { PlanState } from './planState';
import type { ScenarioAdjustments } from './scenarioAdjustments';

export interface Scenario {
  id: string;
  name: string;
  emoji: string;
  description: string;
  isBase: boolean;
  basePlanId?: string;
  snapshot?: PlanState;
  adjustments?: ScenarioAdjustments;
  createdAt: string;
  updatedAt: string;
}
