
export interface YearRatePoint {
  /**
     * @minimum 1900
     * @maximum 2200
     */
  year: number;
  /** Percent points. Example: 6 means 6% and is converted to 0.06 by calculation code. */
  ratePct: number;
}
