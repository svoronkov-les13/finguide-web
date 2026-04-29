
export type Gender = typeof Gender[keyof typeof Gender];


export const Gender = {
  male: 'male',
  female: 'female',
  other: 'other',
} as const;
