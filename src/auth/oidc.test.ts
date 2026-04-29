// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

const storageKey = "finguide.auth.session";
const stateKey = "finguide.oidc.state";

async function loadOidc() {
  vi.resetModules();
  return import("@/auth/oidc");
}

describe("OIDC session helpers", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
    window.localStorage.clear();
    window.sessionStorage.clear();
    vi.useRealTimers();
  });

  it("returns bearer authorization header for a valid Keycloak session", async () => {
    const { getOidcAuthorizationHeader, hasValidAuthSession } = await loadOidc();
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ accessToken: "access-token", tokenType: "Bearer", expiresAt: Date.now() + 60_000 }),
    );

    expect(hasValidAuthSession()).toBe(true);
    expect(getOidcAuthorizationHeader()).toBe("Bearer access-token");
  });

  it("ignores expired token and clears malformed storage", async () => {
    const { getOidcAuthorizationHeader, getStoredAuthSession, hasValidAuthSession } = await loadOidc();
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ accessToken: "expired", tokenType: "Bearer", expiresAt: Date.now() - 1_000 }),
    );
    expect(hasValidAuthSession()).toBe(false);
    expect(getOidcAuthorizationHeader()).toBeUndefined();

    window.localStorage.setItem(storageKey, "not-json");
    expect(getStoredAuthSession()).toBeUndefined();
    expect(window.localStorage.getItem(storageKey)).toBeNull();
  });

  it("clears stored session on logout/reset", async () => {
    const { clearAuthSession, getStoredAuthSession } = await loadOidc();
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ accessToken: "access-token", tokenType: "Bearer", expiresAt: Date.now() + 60_000 }),
    );
    clearAuthSession();
    expect(getStoredAuthSession()).toBeUndefined();
  });

  it("starts Authorization Code + PKCE login with stored state", async () => {
    vi.stubEnv("VITE_FINGUIDE_BASE_PATH", "/fg/");
    vi.stubEnv("VITE_FINGUIDE_OIDC_ISSUER_URL", "http://66.42.121.18/auth/realms/finguide");
    const { beginOidcLogin } = await loadOidc();
    const assign = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { origin: "http://66.42.121.18", pathname: "/fg/dashboard", search: "", hash: "", assign },
    });
    vi.spyOn(crypto, "randomUUID").mockReturnValue("11111111-1111-4111-8111-111111111111");
    vi.spyOn(crypto, "getRandomValues").mockImplementation((array) => {
      (array as Uint8Array).fill(7);
      return array;
    });

    await beginOidcLogin("/dashboard");

    const pending = JSON.parse(window.sessionStorage.getItem(stateKey) || "{}");
    expect(pending.state).toBe("11111111-1111-4111-8111-111111111111");
    expect(pending.returnTo).toBe("/dashboard");
    const url = new URL(assign.mock.calls[0][0]);
    expect(url.pathname).toBe("/auth/realms/finguide/protocol/openid-connect/auth");
    expect(url.searchParams.get("client_id")).toBe("finguide-web");
    expect(url.searchParams.get("response_type")).toBe("code");
    expect(url.searchParams.get("state")).toBe("11111111-1111-4111-8111-111111111111");
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("redirect_uri")).toBe("http://66.42.121.18/fg/auth/callback");
  });

  it("exchanges callback code and stores returned tokens", async () => {
    vi.stubEnv("VITE_FINGUIDE_BASE_PATH", "/fg/");
    vi.stubEnv("VITE_FINGUIDE_OIDC_ISSUER_URL", "http://66.42.121.18/auth/realms/finguide");
    const { completeOidcLogin, getStoredAuthSession } = await loadOidc();
    window.sessionStorage.setItem(
      stateKey,
      JSON.stringify({ state: "state-456", verifier: "verifier-456", returnTo: "/settings" }),
    );
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: "access-token", refresh_token: "refresh-token", token_type: "Bearer", expires_in: 600 }),
    } as Response);

    const result = await completeOidcLogin("?code=code-456&state=state-456");

    expect(fetch).toHaveBeenCalledWith(
      "http://66.42.121.18/auth/realms/finguide/protocol/openid-connect/token",
      expect.objectContaining({ method: "POST" }),
    );
    const body = vi.mocked(fetch).mock.calls[0][1]?.body as URLSearchParams;
    expect(body.get("grant_type")).toBe("authorization_code");
    expect(body.get("code")).toBe("code-456");
    expect(body.get("code_verifier")).toBe("verifier-456");
    expect(body.get("redirect_uri")).toBe("http://66.42.121.18/fg/auth/callback");
    expect(result.returnTo).toBe("/settings");
    expect(getStoredAuthSession()?.accessToken).toBe("access-token");
    expect(window.sessionStorage.getItem(stateKey)).toBeNull();
  });

  it("redirects logout to Keycloak when auth is enabled", async () => {
    vi.stubEnv("VITE_FINGUIDE_AUTH_ENABLED", "true");
    vi.stubEnv("VITE_FINGUIDE_BASE_PATH", "/fg/");
    vi.stubEnv("VITE_FINGUIDE_OIDC_ISSUER_URL", "http://66.42.121.18/auth/realms/finguide");
    const { endOidcSession, getStoredAuthSession } = await loadOidc();
    const assign = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { origin: "http://66.42.121.18", pathname: "/fg/dashboard", search: "", hash: "", assign },
    });
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ accessToken: "access-token", idToken: "id-token", tokenType: "Bearer", expiresAt: Date.now() + 60_000 }),
    );

    endOidcSession();

    expect(getStoredAuthSession()).toBeUndefined();
    const url = new URL(assign.mock.calls[0][0]);
    expect(url.pathname).toBe("/auth/realms/finguide/protocol/openid-connect/logout");
    expect(url.searchParams.get("client_id")).toBe("finguide-web");
    expect(url.searchParams.get("id_token_hint")).toBe("id-token");
    expect(url.searchParams.get("post_logout_redirect_uri")).toBe("http://66.42.121.18/fg/login");
  });
});
