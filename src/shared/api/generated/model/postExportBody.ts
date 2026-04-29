import type { PostExportBodyFormat } from './postExportBodyFormat';
import type { PostExportBodyScope } from './postExportBodyScope';

export type PostExportBody = {
  format: PostExportBodyFormat;
  scope?: PostExportBodyScope;
};
