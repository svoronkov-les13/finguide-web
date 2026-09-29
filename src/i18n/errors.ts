import type { TranslationKey } from "./messages";
import type { Translate, TranslationParams } from "./translate";

/** Keep diagnostics for logging, but render only reviewed dictionary text. */
export class LocalizedError extends Error {
  constructor(
    public readonly translationKey: TranslationKey,
    diagnostic: string,
    public readonly params: TranslationParams = {},
    public readonly requestId?: string,
  ) {
    super(diagnostic);
    this.name = "LocalizedError";
  }
}

export function errorMessage(error: unknown, t: Translate, fallback: TranslationKey = "errors.requestFailed") {
  if (!(error instanceof LocalizedError)) return t(fallback);
  const message = t(error.translationKey, error.params);
  return error.requestId ? `${message} ${t("errors.requestId", { id: error.requestId })}` : message;
}

export function httpErrorKey(status: number): TranslationKey {
  if (status === 401) return "errors.sessionExpired";
  if (status === 403) return "errors.forbidden";
  if (status === 404) return "errors.notFound";
  if (status === 409) return "errors.conflict";
  if (status === 429) return "errors.tooManyRequests";
  return "errors.requestFailed";
}
