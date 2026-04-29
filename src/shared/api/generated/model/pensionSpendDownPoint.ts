
export interface PensionSpendDownPoint {
  year: number;
  age: number;
  beginningCapital: number;
  /** Positive outflow amount. */
  plannedExpense: number;
  nominalReturnPct?: number;
  endingCapital: number;
}
