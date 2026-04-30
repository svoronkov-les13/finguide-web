import { Navigate } from "@tanstack/react-router";
import { ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LoginPage() {
  const auth = useAuth();

  if (auth.authenticated && auth.enabled) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <Card className="w-full max-w-[520px] overflow-hidden border-primary/20 bg-card/95 shadow-soft">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/12 text-primary">
            <ShieldCheck className="size-7" />
          </div>
          <div>
            <CardTitle className="text-3xl">FinGuide ID</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="h-12 w-full text-base" disabled={!auth.enabled} onClick={() => void auth.login("/dashboard")}>
            <Sparkles className="size-4" />
            Войти или зарегистрироваться
          </Button>
          {!auth.enabled ? (
            <p className="rounded-2xl border border-dashed border-border bg-surface/60 p-3 text-center text-xs text-muted-foreground">
              OIDC выключен для текущего стенда. Включение: <code>VITE_FINGUIDE_AUTH_ENABLED=true</code> и параметры Keycloak.
            </p>
          ) : (
            <p className="text-center text-xs text-muted-foreground">
              Используется Authorization Code + PKCE. Пароли не проходят через фронтенд и backend FinGuide.
            </p>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
