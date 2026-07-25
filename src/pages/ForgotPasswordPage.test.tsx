// @vitest-environment jsdom

import { act } from "react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const requestPasswordResetMock = vi.hoisted(() => vi.fn());

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode; to: string }) => (
    <a href={to} {...props}>{children}</a>
  ),
}));

vi.mock("@/auth/passwordReset", () => ({
  requestPasswordReset: requestPasswordResetMock,
}));

vi.mock("@/components/layout/AuthLayout", () => ({
  AuthLayout: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}));

vi.mock("@/i18n/I18nProvider", () => ({
  useI18n: () => ({
    t: (key: string) => ({
      "auth.forgot.title": "Восстановление пароля",
      "auth.forgot.subtitle": "Введите email",
      "auth.forgot.email": "Email",
      "auth.forgot.emailPlaceholder": "alexey@email.com",
      "auth.forgot.submit": "Отправить письмо",
      "auth.forgot.sending": "Отправляем...",
      "auth.forgot.successTitle": "Проверьте почту",
      "auth.forgot.successDescription": "Если аккаунт с таким email существует, ссылка придёт на почту.",
      "auth.forgot.backToLogin": "Вернуться ко входу",
      "auth.forgot.error": "Не удалось отправить письмо.",
    }[key] ?? key),
  }),
}));

describe("ForgotPasswordPage", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    requestPasswordResetMock.mockReset();
    requestPasswordResetMock.mockResolvedValue(undefined);
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.innerHTML = "";
  });

  it("submits the email and shows a neutral success message", async () => {
    const { ForgotPasswordPage } = await import("@/pages/ForgotPasswordPage");

    act(() => {
      root.render(<ForgotPasswordPage />);
    });

    const input = document.getElementById("forgot-password-email") as HTMLInputElement;
    await act(async () => {
      input.value = "stas@example.com";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      await Promise.resolve();
    });

    await act(async () => {
      document.querySelector("form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      await Promise.resolve();
    });

    expect(requestPasswordResetMock).toHaveBeenCalledWith("stas@example.com");
    expect(document.body.textContent).toContain("Проверьте почту");
    expect(document.body.textContent).toContain("Если аккаунт с таким email существует");
  });
});
