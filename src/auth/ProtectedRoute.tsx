import { Navigate, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { useAuth } from "@/auth/AuthProvider";

export function ProtectedRoute() {
  const auth = useAuth();

  if (auth.enabled && !auth.authenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
