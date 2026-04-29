import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  beginOidcLogin,
  completeOidcLogin,
  endOidcSession,
  getStoredAuthSession,
  hasValidAuthSession,
  oidcAuthEnabled,
  type AuthSession,
} from "@/auth/oidc";

type AuthContextValue = {
  enabled: boolean;
  session?: AuthSession;
  authenticated: boolean;
  login: (returnTo?: string) => Promise<void>;
  completeLogin: () => Promise<string>;
  logout: () => void;
  refresh: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState(() => getStoredAuthSession());
  const authenticated = !oidcAuthEnabled || hasValidAuthSession(session);

  const value = useMemo<AuthContextValue>(
    () => ({
      enabled: oidcAuthEnabled,
      session,
      authenticated,
      login: (returnTo?: string) => beginOidcLogin(returnTo),
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
    }),
    [authenticated, session],
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
