import type { z } from "zod";
import type { Translate } from "./translate";
import type { FormEvent } from "react";

/** Browser validation uses the app locale even if the browser itself uses another language. */
export function nativeValidationProps(t: Translate) {
  return {
    onInvalid: (event: FormEvent<HTMLFormElement>) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement)) return;
      input.setCustomValidity("");
      const validity = input.validity;
      if (validity.valid) return;
      const message = validity.valueMissing ? t("validation.required")
        : validity.typeMismatch && input.type === "email" ? t("validation.email")
        : validity.tooShort ? t("validation.tooShort", { min: input.minLength })
        : validity.rangeUnderflow ? t("validation.min", { min: input.min })
        : validity.rangeOverflow ? t("validation.max", { max: input.max })
        : validity.badInput ? t("validation.number")
        : t("validation.invalid");
      input.setCustomValidity(message);
    },
    onInputCapture: (event: FormEvent<HTMLFormElement>) => {
      if (event.target instanceof HTMLInputElement) event.target.setCustomValidity("");
    },
  };
}

export function validationError(t: Translate): z.core.$ZodErrorMap {
  return (issue) => {
    if (issue.code === "too_small") return t("validation.min", { min: String(issue.minimum) });
    if (issue.code === "too_big") return t("validation.max", { max: String(issue.maximum) });
    if (issue.code === "invalid_type" && issue.expected === "int") return t("validation.integer");
    return t("validation.number");
  };
}
