
export type ExportJobFormat = typeof ExportJobFormat[keyof typeof ExportJobFormat];


export const ExportJobFormat = {
  json: 'json',
  csv: 'csv',
  xlsx: 'xlsx',
  pdf: 'pdf',
} as const;
