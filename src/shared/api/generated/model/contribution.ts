import type { CurrencyCode } from './currencyCode';

export interface Contribution {
  id: string;
  goalId: string;
  /** @minimum 0 */
  amount: number;
  currency?: CurrencyCode;
  date: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}
