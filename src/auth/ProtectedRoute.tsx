import { Navigate, Outlet } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/auth/AuthProvider";

export function ProtectedRoute() {
  const auth = useAuth();

  if (auth.enabled && auth.initializing) {
    return (
      <main data-auth-bootstrap className="grid min-h-screen place-items-center bg-[var(--fp-color-background)]">
        <Loader2 className="size-6 animate-spin text-[var(--fp-color-primary)]" />
      </main>
    );
  }

  if (auth.enabled && !auth.authenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
