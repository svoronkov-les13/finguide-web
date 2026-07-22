// @vitest-environment jsdom
import { act } from "react";
import type { ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const authState = vi.hoisted(() => ({
  value: { enabled: true, authenticated: false, initializing: true },
}));

vi.mock("@/auth/AuthProvider", () => ({
  useAuth: () => authState.value,
}));

vi.mock("@tanstack/react-router", () => ({
  Navigate: ({ to }: { to: string }) => <div data-route={to} />,
  Outlet: () => <div data-outlet="true" />,
}));

vi.mock("@/components/layout/AppShell", () => ({
  AppShell: ({ children }: { children: ReactNode }) => <section data-shell="true">{children}</section>,
}));

describe("ProtectedRoute", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("waits for auth bootstrap before redirecting", async () => {
    const { ProtectedRoute } = await import("@/auth/ProtectedRoute");
    authState.value = { enabled: true, authenticated: false, initializing: true };

    act(() => root.render(<ProtectedRoute />));

    expect(container.querySelector("[data-auth-bootstrap]")).not.toBeNull();
    expect(container.querySelector("[data-route]")).toBeNull();
  });

  it("redirects after bootstrap when auth is still unauthenticated", async () => {
    const { ProtectedRoute } = await import("@/auth/ProtectedRoute");
    authState.value = { enabled: true, authenticated: false, initializing: false };

    act(() => root.render(<ProtectedRoute />));

    expect(container.querySelector("[data-route]")?.getAttribute("data-route")).toBe("/login");
  });
});
