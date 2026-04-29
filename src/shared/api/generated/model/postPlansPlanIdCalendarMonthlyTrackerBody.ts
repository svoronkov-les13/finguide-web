import type { PostPlansPlanIdCalendarMonthlyTrackerBodyStatus } from './postPlansPlanIdCalendarMonthlyTrackerBodyStatus';

export type PostPlansPlanIdCalendarMonthlyTrackerBody = {
  /** @pattern ^[0-9]{4}-[0-9]{2}$ */
  month: string;
  status: PostPlansPlanIdCalendarMonthlyTrackerBodyStatus;
  note?: string;
};
