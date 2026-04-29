
export type ExportJobStatus = typeof ExportJobStatus[keyof typeof ExportJobStatus];


export const ExportJobStatus = {
  queued: 'queued',
  processing: 'processing',
  done: 'done',
  failed: 'failed',
} as const;
