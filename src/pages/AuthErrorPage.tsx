import { Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AuthErrorPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <Card className="w-full max-w-[480px] text-center">
        <CardHeader>
          <CardTitle>Доступ не подтверждён</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>Проверьте сессию Keycloak или попробуйте войти ещё раз.</p>
          <Button asChild>
            <Link to="/login">Вернуться ко входу</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
