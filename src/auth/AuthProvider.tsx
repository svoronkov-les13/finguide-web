import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  beginOidcLogin,
  clearAuthSession,
  completeOidcLogin,
  endOidcSession,
  getKeycloakRegistrationUrl,
  getStoredAuthSession,
  hasValidAuthSession,
  loginWithCredentials as oidcLoginWithCredentials,
  oidcAuthEnabled,
  refreshAuthSession,
  registerWithCredentials as oidcRegisterWithCredentials,
  subscribeAuthSession,
  type AuthSession,
} from "@/auth/oidc";

type AuthContextValue = {
  enabled: boolean;
  session?: AuthSession;
  initializing: boolean;
  authenticated: boolean;
  login: (returnTo?: string) => Promise<void>;
  loginWithCredentials: (email: string, password: string) => Promise<AuthSession>;
  registerWithCredentials: (request: { firstName: string; lastName: string; email: string; password: string }) => Promise<AuthSession>;
  completeLogin: () => Promise<string>;
  logout: () => void;
  refresh: () => void;
  registrationUrl: string;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | undefined>(() => (oidcAuthEnabled ? undefined : getStoredAuthSession()));
  const [initializing, setInitializing] = useState(oidcAuthEnabled);
  const authenticated = !oidcAuthEnabled || hasValidAuthSession(session);

  useEffect(() => {
    if (!oidcAuthEnabled) {
      return undefined;
    }

    let alive = true;
    const restoreSession = async () => {
      const storedSession = getStoredAuthSession();
      if (hasValidAuthSession(storedSession)) {
        if (alive) {
          setSession(storedSession);
          setInitializing(false);
        }
        return;
      }

      const refreshedSession = storedSession?.refreshToken ? await refreshAuthSession() : undefined;
      if (storedSession && !refreshedSession) {
        clearAuthSession();
      }
      if (alive) {
        setSession(refreshedSession);
        setInitializing(false);
      }
    };

    void restoreSession();
    const unsubscribe = subscribeAuthSession((nextSession) => {
      if (alive) setSession(nextSession);
    });

    return () => {
      alive = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!oidcAuthEnabled || initializing || !session) return undefined;

    const delayMs = Math.max(session.expiresAt - Date.now() - 30_000, 0);
    const timeout = window.setTimeout(() => {
      if (!session.refreshToken) {
        clearAuthSession();
        return;
      }
      void refreshAuthSession().then((refreshedSession) => {
        if (!refreshedSession) clearAuthSession();
      });
    }, delayMs);

    return () => window.clearTimeout(timeout);
  }, [initializing, session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      enabled: oidcAuthEnabled,
      session,
      initializing,
      authenticated,
      login: (returnTo?: string) => beginOidcLogin(returnTo),
      loginWithCredentials: async (email: string, password: string) => {
        const newSession = await oidcLoginWithCredentials(email, password);
        setSession(newSession);
        return newSession;
      },
      registerWithCredentials: async (request) => {
        const newSession = await oidcRegisterWithCredentials(request);
        setSession(newSession);
        return newSession;
      },
      completeLogin: async () => {
        const result = await completeOidcLogin();
        setSession(result.session);
        return result.returnTo;
      },
      logout: () => {
        endOidcSession();
        setSession(undefined);
      },
      refresh: () => setSession(getStoredAuthSession()),
      registrationUrl: getKeycloakRegistrationUrl(),
    }),
    [authenticated, initializing, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return value;
}
