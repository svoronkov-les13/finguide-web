
export type ImportRequestMode = typeof ImportRequestMode[keyof typeof ImportRequestMode];


export const ImportRequestMode = {
  append: 'append',
  replace: 'replace',
} as const;
