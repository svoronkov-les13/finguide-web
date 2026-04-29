import type { ExportJobFormat } from './exportJobFormat';
import type { ExportJobStatus } from './exportJobStatus';

export interface ExportJob {
  id: string;
  status: ExportJobStatus;
  format: ExportJobFormat;
  downloadUrl?: string;
  expiresAt?: string;
}
