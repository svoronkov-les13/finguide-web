// @vitest-environment jsdom

import { renderToStaticMarkup } from "react-dom/server";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode; to: string }) => (
    <a href={to} {...props}>{children}</a>
  ),
  Navigate: ({ to }: { to: string }) => <div data-route={to} />,
}));

vi.mock("@/auth/AuthProvider", () => ({
  useAuth: () => ({
    authenticated: false,
    enabled: true,
    loginWithCredentials: vi.fn(),
  }),
}));

vi.mock("@/components/layout/AuthLayout", () => ({
  AuthLayout: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}));

vi.mock("@/i18n/I18nProvider", () => ({
  useI18n: () => ({
    t: (key: string) => ({
      "auth.login.title": "Войти в аккаунт",
      "auth.login.subtitle": "Вернитесь к вашему финансовому плану",
      "auth.login.email": "Email",
      "auth.login.emailPlaceholder": "alexey@email.com",
      "auth.login.password": "Пароль",
      "auth.login.passwordPlaceholder": "••••••••",
      "auth.login.submit": "Войти",
      "auth.login.forgotPassword": "Забыли пароль?",
      "auth.login.noAccount": "Нет аккаунта?",
      "auth.login.register": "Зарегистрироваться",
    }[key] ?? key),
  }),
}));

describe("LoginPage forgot password link", () => {
  it("links to the custom password reset page", async () => {
    const { LoginPage } = await import("@/pages/LoginPage");

    const html = renderToStaticMarkup(<LoginPage />);

    expect(html).toContain("Забыли пароль?");
    expect(html).toContain('href="/forgot-password"');
  });
});
