import type { ApiIndexEndpoints } from './apiIndexEndpoints';

export interface ApiIndex {
  name: string;
  version: string;
  status: string;
  basePath: string;
  publicBasePath?: string;
  swaggerUi: string;
  openApi: string;
  endpoints: ApiIndexEndpoints;
}
