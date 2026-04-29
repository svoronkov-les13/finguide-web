const AUTH_SESSION_KEY = "finguide.auth.session";
const OIDC_STATE_KEY = "finguide.oidc.state";
const TOKEN_EXPIRY_SKEW_MS = 30_000;

export type AuthSession = {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  tokenType: string;
  expiresAt: number;
  profile?: {
    sub?: string;
    email?: string;
    name?: string;
    preferredUsername?: string;
  };
};

type PendingAuthorization = {
  state: string;
  verifier: string;
  returnTo: string;
};

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  token_type?: string;
  expires_in?: number;
};

export const oidcAuthEnabled = import.meta.env.VITE_FINGUIDE_AUTH_ENABLED === "true";
export const oidcIssuerUrl = trimTrailingSlash(import.meta.env.VITE_FINGUIDE_OIDC_ISSUER_URL || `${window.location.origin}/auth/realms/finguide`);
export const oidcClientId = import.meta.env.VITE_FINGUIDE_OIDC_CLIENT_ID || "finguide-web";
export const oidcScope = import.meta.env.VITE_FINGUIDE_OIDC_SCOPE || "openid profile email";

export function getStoredAuthSession(): AuthSession | undefined {
  const raw = window.localStorage.getItem(AUTH_SESSION_KEY);
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed.accessToken || !parsed.expiresAt) return undefined;
    return parsed;
  } catch {
    clearAuthSession();
    return undefined;
  }
}

export function hasValidAuthSession(session = getStoredAuthSession()) {
  return Boolean(session?.accessToken && session.expiresAt > Date.now() + TOKEN_EXPIRY_SKEW_MS);
}

export function getOidcAuthorizationHeader() {
  const session = getStoredAuthSession();
  if (!hasValidAuthSession(session)) return undefined;
  return `${session?.tokenType || "Bearer"} ${session?.accessToken}`;
}

export async function beginOidcLogin(returnTo = currentAppPath()) {
  const verifier = base64Url(randomBytes(64));
  const challenge = await sha256Base64Url(verifier);
  const state = crypto.randomUUID();
  const pending: PendingAuthorization = { state, verifier, returnTo };
  window.sessionStorage.setItem(OIDC_STATE_KEY, JSON.stringify(pending));

  const params = new URLSearchParams({
    client_id: oidcClientId,
    redirect_uri: callbackUrl(),
    response_type: "code",
    scope: oidcScope,
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });

  window.location.assign(`${oidcIssuerUrl}/protocol/openid-connect/auth?${params.toString()}`);
}

export async function completeOidcLogin(search = window.location.search) {
  const params = new URLSearchParams(search);
  const error = params.get("error");
  if (error) {
    throw new Error(params.get("error_description") || error);
  }

  const code = params.get("code");
  const state = params.get("state");
  if (!code || !state) {
    throw new Error("Keycloak callback does not contain code/state");
  }

  const pending = readPendingAuthorization();
  if (!pending || pending.state !== state) {
    throw new Error("OIDC state does not match the current browser session");
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: oidcClientId,
    code,
    code_verifier: pending.verifier,
    redirect_uri: callbackUrl(),
  });

  const response = await fetch(`${oidcIssuerUrl}/protocol/openid-connect/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    throw new Error(`Keycloak token exchange failed with HTTP ${response.status}`);
  }

  const token = (await response.json()) as TokenResponse;
  const session = storeTokenResponse(token);
  window.sessionStorage.removeItem(OIDC_STATE_KEY);
  return { session, returnTo: pending.returnTo || "/dashboard" };
}

export function endOidcSession() {
  const session = getStoredAuthSession();
  clearAuthSession();
  const params = new URLSearchParams({
    client_id: oidcClientId,
    post_logout_redirect_uri: appUrl("/login"),
  });
  if (session?.idToken) {
    params.set("id_token_hint", session.idToken);
  }
  if (oidcAuthEnabled) {
    window.location.assign(`${oidcIssuerUrl}/protocol/openid-connect/logout?${params.toString()}`);
  }
}

export function clearAuthSession() {
  window.localStorage.removeItem(AUTH_SESSION_KEY);
}

function storeTokenResponse(token: TokenResponse) {
  if (!token.access_token) {
    throw new Error("Keycloak token response does not contain access_token");
  }
  const session: AuthSession = {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    idToken: token.id_token,
    tokenType: token.token_type || "Bearer",
    expiresAt: Date.now() + (token.expires_in ?? 300) * 1000,
    profile: parseJwtProfile(token.id_token || token.access_token),
  };
  window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  return session;
}

function parseJwtProfile(jwt: string | undefined): AuthSession["profile"] {
  if (!jwt) return undefined;
  const [, payload] = jwt.split(".");
  if (!payload) return undefined;
  try {
    const json = JSON.parse(window.atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return {
      sub: json.sub,
      email: json.email,
      name: json.name,
      preferredUsername: json.preferred_username,
    };
  } catch {
    return undefined;
  }
}

function readPendingAuthorization() {
  const raw = window.sessionStorage.getItem(OIDC_STATE_KEY);
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as PendingAuthorization;
  } catch {
    return undefined;
  }
}

function callbackUrl() {
  return appUrl("/auth/callback");
}

function currentAppPath() {
  const base = appBasePath();
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  return base && current.startsWith(base) ? current.slice(base.length) || "/dashboard" : current;
}

function appUrl(path: string) {
  const base = appBasePath();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${window.location.origin}${base}${normalizedPath}`;
}

function appBasePath() {
  const value = import.meta.env.VITE_FINGUIDE_BASE_PATH || "/";
  const normalized = value.endsWith("/") ? value.slice(0, -1) : value;
  return normalized === "/" ? "" : normalized;
}

function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function randomBytes(size: number) {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return bytes;
}

function base64Url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sha256Base64Url(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return base64Url(new Uint8Array(digest));
}
