import type { ErrorResponseErrorDetails } from './errorResponseErrorDetails';

export type ErrorResponseError = {
  code: string;
  message: string;
  requestId: string;
  details?: ErrorResponseErrorDetails;
};
