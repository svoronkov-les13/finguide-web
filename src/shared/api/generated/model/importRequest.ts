import type { ImportRequestDataItem } from './importRequestDataItem';
import type { ImportRequestMode } from './importRequestMode';
import type { ImportRequestType } from './importRequestType';

export interface ImportRequest {
  type: ImportRequestType;
  mode?: ImportRequestMode;
  data: ImportRequestDataItem[];
}
