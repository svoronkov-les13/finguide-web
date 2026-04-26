import { Page, PageHeader } from "@/components/layout/Page";
import { Card } from "@/components/ui/card";

const questions = [
  ["Откуда берутся данные?", "Данные загружены в mock API из структуры Excel-модели и могут редактироваться внутри SPA."],
  ["Что делает сценарий «Что если?»", "Он меняет доходность, инфляцию и возраст пенсии, после чего прогноз пересчитывается в клиентском mock API."],
  ["Можно ли подключить реальный backend?", "Да. Экранный слой ходит через financialPlanClient, поэтому mock API можно заменить HTTP-клиентом без переписывания страниц."],
];

export function FaqPage() {
  return (
    <Page maxWidth="narrow">
      <PageHeader title="FAQ" description="Короткие ответы по текущему прототипу." />
      {questions.map(([question, answer]) => (
        <Card key={question} className="p-5">
          <h2 className="font-bold">{question}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{answer}</p>
        </Card>
      ))}
    </Page>
  );
}
