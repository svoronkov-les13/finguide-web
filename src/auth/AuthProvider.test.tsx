// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const storageKey = "finguide.auth.session";

async function loadAuthProvider() {
  vi.resetModules();
  return import("@/auth/AuthProvider");
}

describe("AuthProvider session lifecycle", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    vi.stubEnv("VITE_FINGUIDE_AUTH_ENABLED", "true");
    vi.stubEnv("VITE_FINGUIDE_OIDC_ISSUER_URL", "https://finguide.les13.tech/auth/realms/finguide");
    window.localStorage.clear();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.useRealTimers();
  });

  it("refreshes an expired stored access token during bootstrap before marking auth ready", async () => {
    const { AuthProvider, useAuth } = await loadAuthProvider();
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ accessToken: "expired-token", refreshToken: "refresh-token", tokenType: "Bearer", expiresAt: Date.now() - 1_000 }),
    );
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: "fresh-token", refresh_token: "fresh-refresh", token_type: "Bearer", expires_in: 600 }),
    } as Response);

    function Probe() {
      const auth = useAuth();
      return <div data-state={auth.initializing ? "initializing" : auth.authenticated ? "authenticated" : "anonymous"} data-token={auth.session?.accessToken ?? ""} />;
    }

    await act(async () => {
      root.render(<AuthProvider><Probe /></AuthProvider>);
    });

    expect(container.firstElementChild?.getAttribute("data-state")).toBe("authenticated");
    expect(container.firstElementChild?.getAttribute("data-token")).toBe("fresh-token");
  });

  it("marks auth unauthenticated when bootstrap refresh fails", async () => {
    const { AuthProvider, useAuth } = await loadAuthProvider();
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ accessToken: "expired-token", refreshToken: "refresh-token", tokenType: "Bearer", expiresAt: Date.now() - 1_000 }),
    );
    vi.spyOn(globalThis, "fetch").mockResolvedValue({ ok: false } as Response);

    function Probe() {
      const auth = useAuth();
      return <div data-state={auth.initializing ? "initializing" : auth.authenticated ? "authenticated" : "anonymous"} />;
    }

    await act(async () => {
      root.render(<AuthProvider><Probe /></AuthProvider>);
    });

    expect(container.firstElementChild?.getAttribute("data-state")).toBe("anonymous");
    expect(window.localStorage.getItem(storageKey)).toBeNull();
  });

  it("updates React auth state when another auth helper refreshes the session", async () => {
    const { AuthProvider, useAuth } = await loadAuthProvider();
    const { refreshAuthSession } = await import("@/auth/oidc");
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ accessToken: "old-token", refreshToken: "refresh-token", tokenType: "Bearer", expiresAt: Date.now() - 1_000 }),
    );
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: "fresh-token", refresh_token: "fresh-refresh", token_type: "Bearer", expires_in: 600 }),
    } as Response);

    function Probe() {
      const auth = useAuth();
      return <div data-token={auth.session?.accessToken ?? ""} />;
    }

    await act(async () => {
      root.render(<AuthProvider><Probe /></AuthProvider>);
    });
    await act(async () => {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({ accessToken: "expired-again", refreshToken: "fresh-refresh", tokenType: "Bearer", expiresAt: Date.now() - 1_000 }),
      );
      await refreshAuthSession();
    });

    expect(container.firstElementChild?.getAttribute("data-token")).toBe("fresh-token");
  });

  it("refreshes the session shortly before the access token expires", async () => {
    vi.useFakeTimers();
    const now = new Date("2026-07-22T07:30:00.000Z");
    vi.setSystemTime(now);
    const { AuthProvider, useAuth } = await loadAuthProvider();
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ accessToken: "active-token", refreshToken: "refresh-token", tokenType: "Bearer", expiresAt: now.getTime() + 35_000 }),
    );
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: "timer-token", refresh_token: "timer-refresh", token_type: "Bearer", expires_in: 600 }),
    } as Response);

    function Probe() {
      const auth = useAuth();
      return <div data-token={auth.session?.accessToken ?? ""} />;
    }

    await act(async () => {
      root.render(<AuthProvider><Probe /></AuthProvider>);
    });
    expect(container.firstElementChild?.getAttribute("data-token")).toBe("active-token");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5_000);
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(container.firstElementChild?.getAttribute("data-token")).toBe("timer-token");
  });

  it("clears auth state at token expiry when no refresh token exists", async () => {
    vi.useFakeTimers();
    const now = new Date("2026-07-22T07:35:00.000Z");
    vi.setSystemTime(now);
    const { AuthProvider, useAuth } = await loadAuthProvider();
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ accessToken: "active-token", tokenType: "Bearer", expiresAt: now.getTime() + 35_000 }),
    );

    function Probe() {
      const auth = useAuth();
      return <div data-state={auth.initializing ? "initializing" : auth.authenticated ? "authenticated" : "anonymous"} />;
    }

    await act(async () => {
      root.render(<AuthProvider><Probe /></AuthProvider>);
    });
    expect(container.firstElementChild?.getAttribute("data-state")).toBe("authenticated");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5_000);
    });

    expect(container.firstElementChild?.getAttribute("data-state")).toBe("anonymous");
    expect(window.localStorage.getItem(storageKey)).toBeNull();
  });
});
