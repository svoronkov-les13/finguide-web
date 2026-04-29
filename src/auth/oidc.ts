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
  const state = randomState();
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

function randomState() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return base64Url(randomBytes(32));
}

function randomBytes(size: number) {
  const bytes = new Uint8Array(size);
  const cryptoApi = globalThis.crypto;
  if (!cryptoApi?.getRandomValues) {
    throw new Error("Secure random generator is not available in this browser");
  }
  cryptoApi.getRandomValues(bytes);
  return bytes;
}

function base64Url(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sha256Base64Url(value: string) {
  const input = new TextEncoder().encode(value);
  const subtle = globalThis.crypto?.subtle;
  if (subtle) {
    const digest = await subtle.digest("SHA-256", input);
    return base64Url(new Uint8Array(digest));
  }
  return base64Url(sha256Fallback(input));
}

function sha256Fallback(input: Uint8Array) {
  const k = new Uint32Array([
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ]);
  const bitLength = input.length * 8;
  const paddedLength = Math.ceil((input.length + 9) / 64) * 64;
  const padded = new Uint8Array(paddedLength);
  padded.set(input);
  padded[input.length] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(paddedLength - 4, bitLength >>> 0, false);

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;
  const w = new Uint32Array(64);

  for (let offset = 0; offset < paddedLength; offset += 64) {
    for (let i = 0; i < 16; i += 1) {
      w[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i += 1) {
      const s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let i = 0; i < 64; i += 1) {
      const s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + s1 + ch + k[i] + w[i]) >>> 0;
      const s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + maj) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  const output = new Uint8Array(32);
  const outputView = new DataView(output.buffer);
  [h0, h1, h2, h3, h4, h5, h6, h7].forEach((value, index) => outputView.setUint32(index * 4, value, false));
  return output;
}

function rightRotate(value: number, bits: number) {
  return (value >>> bits) | (value << (32 - bits));
}
