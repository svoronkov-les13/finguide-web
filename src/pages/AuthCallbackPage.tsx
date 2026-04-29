import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthCallbackPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string>();

  useEffect(() => {
    let alive = true;
    auth
      .completeLogin()
      .then((returnTo) => {
        if (alive) void navigate({ to: returnTo || "/dashboard", replace: true });
      })
      .catch((caught: unknown) => {
        if (alive) setError(caught instanceof Error ? caught.message : "Не удалось завершить вход");
      });
    return () => {
      alive = false;
    };
  }, [auth, navigate]);

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <Card className="w-full max-w-[480px] text-center">
        <CardHeader>
          <CardTitle>{error ? "Ошибка входа" : "Завершаем вход"}</CardTitle>
          <CardDescription>{error ?? "Получаем токен Keycloak и возвращаем вас в FinGuide."}</CardDescription>
        </CardHeader>
        {!error ? (
          <CardContent className="flex justify-center pb-8">
            <Loader2 className="size-7 animate-spin text-primary" />
          </CardContent>
        ) : null}
      </Card>
    </main>
  );
}
