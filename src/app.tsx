import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthProvider } from "@/auth/AuthProvider";
import { CommandPalette } from "@/components/layout/CommandPalette";
import { ErrorToast } from "@/components/layout/ErrorToast";
import { I18nProvider } from "@/i18n/I18nProvider";
import { router } from "@/router";
import { useUiStore } from "@/store/uiStore";

export function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        mutationCache: new MutationCache({
          onError: (error) => {
            useUiStore.getState().showError(error instanceof Error ? error.message : String(error));
          },
        }),
        defaultOptions: {
          queries: {
            // plan data is refreshed explicitly after mutations; tab focus must
            // not re-trigger the whole multi-request plan pyramid
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        useUiStore.getState().setCommandOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          <div className="mesh-bg">
            <RouterProvider router={router} />
            <CommandPalette />
            <ErrorToast />
          </div>
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}
