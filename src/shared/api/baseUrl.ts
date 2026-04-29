const DEFAULT_API_BASE_URL = "/finguide-mock/api/v1";

function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export const apiBaseUrl = trimTrailingSlash(import.meta.env.VITE_FINGUIDE_API_BASE_URL || DEFAULT_API_BASE_URL);

export const demoBearerToken = import.meta.env.VITE_FINGUIDE_BEARER_TOKEN || "mock-access-token-java21";
