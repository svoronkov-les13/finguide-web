import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import {
  beginOidcLogin,
  completeOidcLogin,
  endOidcSession,
  getKeycloakRegistrationUrl,
  getStoredAuthSession,
  hasValidAuthSession,
  loginWithCredentials as oidcLoginWithCredentials,
  oidcAuthEnabled,
  type AuthSession,
} from "@/auth/oidc";

type AuthContextValue = {
  enabled: boolean;
  session?: AuthSession;
  authenticated: boolean;
  login: (returnTo?: string) => Promise<void>;
  loginWithCredentials: (email: string, password: string) => Promise<AuthSession>;
  completeLogin: () => Promise<string>;
  logout: () => void;
  refresh: () => void;
  registrationUrl: string;
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
      loginWithCredentials: async (email: string, password: string) => {
        const newSession = await oidcLoginWithCredentials(email, password);
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
