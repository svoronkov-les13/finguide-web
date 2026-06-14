import { CircleHelp, Search } from "lucide-react";
import { Page } from "@/components/layout/Page";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/i18n/I18nProvider";

export function FaqPage() {
  const { t } = useI18n();

  const questions = [
    [t("faq.q1"), t("faq.a1")],
    [t("faq.q2"), t("faq.a2")],
    [t("faq.q3"), t("faq.a3")],
    [t("faq.q4"), t("faq.a4")],
  ];

  return (
    <Page bottom={false}>
      <header className="flex min-w-0 items-center gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-soft">
          <CircleHelp className="size-5" />
        </span>
        <div>
          <h1 className="text-[28px] font-bold leading-tight">{t("faq.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("faq.subtitle")}</p>
        </div>
      </header>

      <Card className="p-3">
        <label className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2">
          <Search className="size-4 text-muted-foreground" />
          <Input className="h-8 border-0 bg-transparent p-0 shadow-none focus:ring-0" placeholder={t("faq.searchPlaceholder")} />
        </label>
      </Card>

      <div className="grid gap-3">
        {questions.map(([question, answer], index) => (
          <Card key={question} className="p-5">
            <div className="grid grid-cols-[28px_1fr] gap-3">
              <span className="grid size-7 place-items-center rounded-full border border-border bg-surface text-xs text-muted-foreground">{index + 1}</span>
              <div>
                <h2 className="font-bold">{question}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{answer}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Page>
  );
}
