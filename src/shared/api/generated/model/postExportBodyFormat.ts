
export type PostExportBodyFormat = typeof PostExportBodyFormat[keyof typeof PostExportBodyFormat];


export const PostExportBodyFormat = {
  json: 'json',
  csv: 'csv',
  xlsx: 'xlsx',
  pdf: 'pdf',
} as const;
