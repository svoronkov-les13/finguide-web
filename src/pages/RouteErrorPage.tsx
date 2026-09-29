import { Link, type ErrorComponentProps } from "@tanstack/react-router";
import { useI18n } from "@/i18n/I18nProvider";
import { Button } from "@/components/ui/button";

function RouteMessage({ missing, retry }: { missing?: boolean; retry?: () => void }) {
  const { t } = useI18n();
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <section className="max-w-md space-y-4 text-center">
        <h1 className="text-2xl font-bold">{t(missing ? "app.notFoundTitle" : "app.errorTitle")}</h1>
        <p>{t(missing ? "app.notFoundDescription" : "app.errorDescription")}</p>
        {retry && <Button onClick={retry}>{t("app.retry")}</Button>}
        <Link to="/dashboard" className="block underline">{t("app.home")}</Link>
      </section>
    </main>
  );
}

export function RouteErrorPage({ reset }: ErrorComponentProps) {
  return <RouteMessage retry={reset} />;
}

export function NotFoundPage() {
  return <RouteMessage missing />;
}
