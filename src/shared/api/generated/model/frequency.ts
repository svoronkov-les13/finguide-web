
export type Frequency = typeof Frequency[keyof typeof Frequency];


export const Frequency = {
  monthly: 'monthly',
  yearly: 'yearly',
  one_time: 'one_time',
} as const;
