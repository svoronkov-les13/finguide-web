
export type GrowthType = typeof GrowthType[keyof typeof GrowthType];


export const GrowthType = {
  manual: 'manual',
  inflation: 'inflation',
  none: 'none',
  schedule: 'schedule',
} as const;
