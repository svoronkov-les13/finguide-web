/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Page } from "@/components/layout/Page";
import { CheckCircle2, ChevronLeft, ChevronUp, Info, Settings2, WalletCards, ShieldCheck, ChevronDown, Shield, Loader2 } from "lucide-react";
import { usePlanQuery, useUpdateSettingsMutation } from "@/api/planQueries";
import { useI18n } from "@/i18n/I18nProvider";
import { Card } from "@/components/ui/card";
import { formatRub, formatPercent } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from "recharts";

export function PensionPage() {
  const { data: plan } = usePlanQuery();
  const { mutate: updateSettings, isPending: isUpdating } = useUpdateSettingsMutation();
  const { t } = useI18n();
  
  const [isCalculated, setIsCalculated] = useState(false);
  const [spendingScenario, setSpendingScenario] = useState<"save" | "spend">("spend");
  const [useGovPension, setUseGovPension] = useState(true);
  const [paramsOpen, setParamsOpen] = useState(true);
  const [scenariosOpen, setScenariosOpen] = useState(true);
  const [retirementMode, setRetirementMode] = useState<"age" | "year">("age");

  // Local state for the form so we can edit it before hitting "Calculate"
  const [formState, setFormState] = useState({
    currentAge: 30,
    retirementAge: 60,
    targetMonthlySpend: 100000,
    investmentReturn: 0.1,
  });

  useEffect(() => {
    if (plan?.settings) {
      setFormState({
        currentAge: plan.settings.currentAge,
        retirementAge: plan.settings.retirementAge,
        targetMonthlySpend: plan.settings.targetMonthlySpend,
        investmentReturn: plan.settings.investmentReturn,
      });
    }
  }, [plan?.settings]);

  if (!plan) return <Card className="h-[600px] max-w-[1256px] animate-pulse bg-[var(--fp-color-muted)]/60" />;

  const settings = plan.settings;
  const currentYear = new Date().getFullYear();
  const yearsToRetirement = formState.retirementAge - formState.currentAge;
  const retirementYear = currentYear + yearsToRetirement;
  
  const targetMonthlySpend = formState.targetMonthlySpend;
  const inflationMultiplier = Math.pow(1 + settings.inflation, yearsToRetirement);
  const futureMonthlySpend = targetMonthlySpend * inflationMultiplier;
  
  const targetCapital = plan.dashboardSnapshot?.pensionCapitalRub || 80330049;
  const retirementCapital = plan.forecast.find(p => p.age === formState.retirementAge)?.capital || 2373688270;
  
  const chartData = plan.forecast.filter(p => p.age <= 100).map(p => ({
    age: p.age,
    capital: p.capital,
    year: p.year
  }));

  const isCapitalSufficient = retirementCapital >= targetCapital;

  const handleCalculate = () => {
    updateSettings({
      currentAge: formState.currentAge,
      retirementAge: formState.retirementAge,
      targetMonthlySpend: formState.targetMonthlySpend,
      investmentReturn: formState.investmentReturn,
    });
    setIsCalculated(true);
  };

  return (
    <Page>
      <div>
        <button className="flex items-center text-[13px] font-medium text-[var(--fp-color-label)] hover:text-[var(--fp-color-foreground)] transition-colors mb-4 cursor-pointer bg-transparent border-none p-0">
          <ChevronLeft className="size-4 mr-1" /> {t("cashflow.back")}
        </button>
        <header className="grid gap-2">
          <h1 className="text-[28px] font-bold tracking-tight text-[var(--fp-color-foreground)]">{t("pension.title")}</h1>
          <p className="text-[var(--fp-color-label)] max-w-[700px] leading-relaxed text-[15px]">
            {t("pension.description")}
          </p>
        </header>
      </div>

      <div className="grid gap-4 mt-2">
        {/* Параметры расчёта */}
        <div className="rounded-[24px] border border-[var(--fp-color-border)] bg-[var(--fp-color-card)] overflow-hidden shadow-sm">
          <div 
            className="flex items-center justify-between p-6 cursor-pointer select-none transition-colors hover:bg-[var(--fp-color-surface-hover)]"
            onClick={() => setParamsOpen(!paramsOpen)}
          >
            <div className="flex items-center gap-3">
              <Settings2 className="size-[20px] text-[var(--fp-color-foreground)]" />
              <h2 className="text-[17px] font-semibold">{t("pension.calcParams")}</h2>
            </div>
            {paramsOpen ? <ChevronUp className="size-5 text-[var(--fp-color-muted-foreground)]" /> : <ChevronDown className="size-5 text-[var(--fp-color-muted-foreground)]" />}
          </div>

          {paramsOpen && (
            <div className="px-6 pb-8 grid gap-10 pt-2">
              {/* Row 1 */}
              <div className="grid grid-cols-3 gap-6 max-[800px]:grid-cols-1">
                <div>
                  <label className="text-[13px] text-[var(--fp-color-label)] mb-2 block leading-tight">{t("pension.currentAge")}</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={formState.currentAge} 
                      onChange={(e) => setFormState(s => ({ ...s, currentAge: Number(e.target.value) }))}
                      className="h-[44px] w-full rounded-[14px] bg-[#f3f4f6] border-none pl-4 pr-14 outline-none font-medium text-[15px]" 
                    />
                    <span className="absolute right-4 top-[11px] text-[15px] text-[var(--fp-color-muted-foreground)]">{t("pension.years")}</span>
                  </div>
                </div>
                
                <div>
                  <label className="text-[13px] text-[var(--fp-color-label)] mb-2 block leading-tight">{t("pension.retirementAge")}</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input 
                        type="number" 
                        name="retirementAge"
                        value={retirementMode === "age" ? formState.retirementAge : (plan.settings.birthYear + formState.retirementAge)} 
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (retirementMode === "age") {
                            setFormState(s => ({ ...s, retirementAge: val }));
                          } else {
                            setFormState(s => ({ ...s, retirementAge: val - plan.settings.birthYear }));
                          }
                        }}
                        className="h-[44px] w-full rounded-[14px] bg-[#f3f4f6] border-none pl-4 pr-14 outline-none font-medium text-[15px]" 
                      />
                      <span className="absolute right-4 top-[11px] text-[15px] text-[var(--fp-color-muted-foreground)]">
                        {retirementMode === "age" ? t("pension.years") : t("pension.year", { defaultValue: "год" })}
                      </span>
                    </div>
                    <div className="flex bg-[#f3f4f6] rounded-[14px] p-1 items-center h-[44px]">
                      <button 
                        onClick={() => setRetirementMode("age")}
                        className={`h-full px-3.5 rounded-[10px] text-[13px] font-medium transition-colors ${retirementMode === "age" ? "bg-white shadow-sm text-[var(--fp-color-foreground)]" : "text-[var(--fp-color-label)] hover:text-[var(--fp-color-foreground)]"}`}
                      >
                        {t("pension.age")}
                      </button>
                      <button 
                        onClick={() => setRetirementMode("year")}
                        className={`h-full px-3.5 rounded-[10px] text-[13px] font-medium transition-colors ${retirementMode === "year" ? "bg-white shadow-sm text-[var(--fp-color-foreground)]" : "text-[var(--fp-color-label)] hover:text-[var(--fp-color-foreground)]"}`}
                      >
                        {t("pension.year")}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[13px] text-[var(--fp-color-label)] mb-2 block leading-tight">{t("pension.pensionCurrency")}</label>
                  <select className="h-[44px] w-full rounded-[14px] bg-[#f3f4f6] border-none px-4 text-[15px] font-medium outline-none appearance-none cursor-pointer">
                    <option>{t("pension.usd")}</option>
                    <option>{t("pension.rub")}</option>
                  </select>
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-3 gap-6 max-[800px]:grid-cols-1">
                <div>
                  <label className="text-[13px] text-[var(--fp-color-label)] mb-2 block leading-tight">{t("pension.desiredExpenses")}</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={formState.targetMonthlySpend || ""} 
                      onChange={(e) => setFormState(s => ({ ...s, targetMonthlySpend: Number(e.target.value) }))}
                      placeholder="Укажите сумму" 
                      className="h-[44px] w-full rounded-[14px] bg-[#f3f4f6] border-none pl-4 pr-16 outline-none font-medium text-[15px] placeholder:text-[var(--fp-color-muted-foreground)]/60" 
                    />
                    <span className="absolute right-4 top-[11px] text-[15px] text-[var(--fp-color-muted-foreground)]">{t("pension.perMonth")}</span>
                  </div>
                  <div className="text-[12px] text-[var(--fp-color-label)] flex items-center gap-1.5 mt-2">
                    <Info className="size-[14px] shrink-0" /> <span className="leading-tight">{t("pension.currentPricesNote")}</span>
                  </div>
                </div>

                <div>
                  <label className="text-[13px] text-[var(--fp-color-label)] mb-2 block leading-tight h-auto min-h-[18px]">
                    {t("pension.expectedInflation")}
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      readOnly 
                      value={settings.inflation * 100} 
                      className="h-[44px] w-full rounded-[14px] bg-[#f3f4f6] border-none pl-4 pr-16 outline-none font-medium text-[15px] text-[var(--fp-color-label)] opacity-70" 
                    />
                    <span className="absolute right-4 top-[11px] text-[15px] text-[var(--fp-color-label)]">{t("pension.percentPerYear")}</span>
                  </div>
                  <div className="text-[12px] text-[var(--fp-color-label)] flex items-center gap-1.5 mt-2">
                    <Info className="size-[14px] shrink-0" /> 
                    <span className="leading-tight">Задаётся в <Link to="/general" className="font-semibold text-[var(--fp-color-foreground)] border-b border-[var(--fp-color-foreground)] cursor-pointer">{t("routes.general").toLowerCase()}</Link></span>
                  </div>
                </div>

                <div>
                  <label className="text-[13px] text-[var(--fp-color-label)] mb-2 block leading-tight h-auto min-h-[18px]">
                    {t("pension.expensesWithInflation")}
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      readOnly 
                      value={Math.round(futureMonthlySpend)} 
                      className="h-[44px] w-full rounded-[14px] bg-[#f3f4f6] border-none pl-4 pr-16 outline-none font-medium text-[15px] text-[var(--fp-color-label)] opacity-70" 
                    />
                    <span className="absolute right-4 top-[11px] text-[15px] text-[var(--fp-color-label)]">{t("pension.perMonth")}</span>
                  </div>
                </div>
              </div>

              {/* Slider */}
              <div className="grid gap-1 mt-6">
                <div className="flex justify-between items-end mb-3">
                  <label className="text-[14px] font-medium text-[var(--fp-color-label)]">{t("pension.expectedReturn")}</label>
                  <div className="px-3 py-1 rounded-[10px] bg-[#f3f4f6] text-[14px] font-bold text-[var(--fp-color-foreground)]">
                    {Math.round(formState.investmentReturn * 100)}{t("pension.percentAnnual")}
                  </div>
                </div>
                
                <div className="relative pt-2 pb-1">
                  <input 
                    type="range" 
                    min="0" 
                    max="25" 
                    value={Math.round(formState.investmentReturn * 100)} 
                    onChange={(e) => setFormState(s => ({ ...s, investmentReturn: Number(e.target.value) / 100 }))}
                    className="w-full h-[4px] bg-[#e5e7eb] appearance-none cursor-pointer rounded-full outline-none
                      [&::-webkit-slider-runnable-track]:h-[4px] [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-gradient-to-r [&::-webkit-slider-runnable-track]:from-[var(--fp-color-foreground)] [&::-webkit-slider-runnable-track]:to-[var(--fp-color-foreground)] [&::-webkit-slider-runnable-track]:bg-no-repeat
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-[20px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-[4px] [&::-webkit-slider-thumb]:border-[var(--fp-color-foreground)] [&::-webkit-slider-thumb]:-mt-[8px] [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-10"
                    style={{ backgroundSize: `${(Math.round(formState.investmentReturn * 100) / 25) * 100}% 100%` }}
                  />
                  <div className="flex justify-between text-[12px] font-medium text-[var(--fp-color-muted-foreground)] mt-3">
                    <span>0%</span>
                    <span>25%</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-[13px] font-medium text-[var(--fp-color-label)] mt-2">
                  <span>{t("pension.balancedPortfolio")}</span>
                  <span>{t("pension.realReturn", { percent: Math.round((formState.investmentReturn - settings.inflation) * 100 * 10) / 10 })}</span>
                </div>
              </div>

              {/* Portfolio table */}
              <div className="bg-[var(--fp-color-background)] rounded-[20px] p-6 mt-2">
                <h3 className="text-[15px] font-bold text-[var(--fp-color-foreground)] mb-4">{t("pension.portfolioBenchmarks")}</h3>
                <div className="grid gap-0">
                  <div className="flex justify-between py-3 border-b border-[var(--fp-color-border)]/50 text-[14px] text-[var(--fp-color-foreground)]">
                    <span className="text-[var(--fp-color-label)]">{t("pension.depositsBonds")}</span><span className="font-bold">4-7%</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-[var(--fp-color-border)]/50 text-[14px] text-[var(--fp-color-foreground)]">
                    <span className="text-[var(--fp-color-label)]">{t("pension.conservativePortfolio")}</span><span className="font-bold">6-8%</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-[var(--fp-color-border)]/50 text-[14px] text-[var(--fp-color-foreground)]">
                    <span className="text-[var(--fp-color-label)]">{t("pension.balancedPortfolio")}</span><span className="font-bold">8-12%</span>
                  </div>
                  <div className="flex justify-between py-3 border-b border-[var(--fp-color-border)]/50 text-[14px] text-[var(--fp-color-foreground)]">
                    <span className="text-[var(--fp-color-label)]">{t("pension.aggressivePortfolio")}</span><span className="font-bold">12-18%</span>
                  </div>
                  <div className="flex justify-between pt-3 pb-1 text-[14px] text-[var(--fp-color-foreground)]">
                    <span className="text-[var(--fp-color-label)]">{t("pension.cryptoVenture")}</span><span className="font-bold">18%+</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Сценарии расходования */}
        <div className="rounded-[24px] border border-[var(--fp-color-border)] bg-[var(--fp-color-card)] overflow-hidden shadow-sm">
          <div 
            className="flex items-center justify-between p-6 cursor-pointer select-none transition-colors hover:bg-[var(--fp-color-surface-hover)]"
            onClick={() => setScenariosOpen(!scenariosOpen)}
          >
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-[20px] text-[var(--fp-color-foreground)]" />
              <h2 className="text-[17px] font-semibold">{t("pension.spendingScenarios")}</h2>
            </div>
            {scenariosOpen ? <ChevronUp className="size-5 text-[var(--fp-color-muted-foreground)]" /> : <ChevronDown className="size-5 text-[var(--fp-color-muted-foreground)]" />}
          </div>

          {scenariosOpen && (
            <div className="px-6 pb-8 pt-0 grid gap-4">
              <label 
                className={`flex items-center justify-between gap-4 p-5 rounded-[20px] border cursor-pointer transition-colors ${spendingScenario === 'save' ? 'border-[var(--fp-color-border)] bg-[var(--fp-color-background)]' : 'border-[var(--fp-color-border)] bg-[var(--fp-color-card)] hover:bg-[var(--fp-color-surface-hover)]'}`}
                onClick={() => setSpendingScenario("save")}
              >
                <div className="flex gap-4">
                  <div className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-[var(--fp-color-card)] border border-[var(--fp-color-border)] shadow-sm">
                    <Shield className="size-5 text-[var(--fp-color-muted-foreground)]" />
                  </div>
                  <div className="pt-0.5">
                    <h3 className="font-medium text-[15px] mb-1">{t("pension.saveCapitalTitle")}</h3>
                    <p className="text-[13px] text-[var(--fp-color-label)]">{t("pension.saveCapitalDesc")}</p>
                  </div>
                </div>
                <div className={`relative inline-flex h-7 w-[46px] shrink-0 items-center rounded-full transition-colors ${spendingScenario === 'save' ? 'bg-[var(--fp-color-primary)]' : 'bg-[#e5e7eb]'}`}>
                  <span className={`inline-block size-[22px] transform rounded-full bg-white shadow-sm transition-transform ${spendingScenario === 'save' ? 'translate-x-[22px]' : 'translate-x-[3px]'}`} />
                </div>
              </label>

              <label 
                className={`flex items-center justify-between gap-4 p-5 rounded-[20px] border cursor-pointer transition-colors ${spendingScenario === 'spend' ? 'border-[var(--fp-color-border)] bg-[var(--fp-color-background)]' : 'border-[var(--fp-color-border)] bg-[var(--fp-color-card)] hover:bg-[var(--fp-color-surface-hover)]'}`}
                onClick={() => setSpendingScenario("spend")}
              >
                <div className="flex gap-4">
                  <div className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-[var(--fp-color-card)] border border-[var(--fp-color-border)] shadow-sm">
                    <WalletCards className="size-5 text-[var(--fp-color-muted-foreground)]" />
                  </div>
                  <div className="pt-0.5">
                    <h3 className="font-medium text-[15px] mb-1">{t("pension.spendCapitalTitle")}</h3>
                    <p className="text-[13px] text-[var(--fp-color-label)]">{t("pension.spendCapitalDesc")}</p>
                  </div>
                </div>
                <div className={`relative inline-flex h-7 w-[46px] shrink-0 items-center rounded-full transition-colors ${spendingScenario === 'spend' ? 'bg-[var(--fp-color-primary)]' : 'bg-[#e5e7eb]'}`}>
                  <span className={`inline-block size-[22px] transform rounded-full bg-white shadow-sm transition-transform ${spendingScenario === 'spend' ? 'translate-x-[22px]' : 'translate-x-[3px]'}`} />
                </div>
              </label>

              <div className="flex items-center justify-between mt-4 pl-2">
                <label className="flex items-center gap-4 cursor-pointer" onClick={() => setUseGovPension(!useGovPension)}>
                  <div className={`relative inline-flex h-7 w-[46px] shrink-0 items-center rounded-full transition-colors ${useGovPension ? 'bg-[var(--fp-color-primary)]' : 'bg-[#e5e7eb]'}`}>
                    <span className={`inline-block size-[22px] transform rounded-full bg-white shadow-sm transition-transform ${useGovPension ? 'translate-x-[22px]' : 'translate-x-[3px]'}`} />
                  </div>
                  <div className="pt-0.5">
                    <h3 className="font-semibold text-[15px] mb-0.5 text-[var(--fp-color-foreground)]">{t("pension.useGovPensionTitle")}</h3>
                    <p className="text-[13px] text-[var(--fp-color-label)]">{t("pension.useGovPensionDesc")}</p>
                  </div>
                </label>
                <button 
                  className="h-[46px] px-8 rounded-full bg-[var(--fp-color-primary)] text-white font-medium hover:opacity-90 transition-opacity flex items-center gap-2" 
                  onClick={handleCalculate}
                  disabled={isUpdating}
                >
                  {isUpdating && <Loader2 className="size-4 animate-spin" />}
                  {t("pension.calculate")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Section - Hidden until calculated */}
      {isCalculated && (
        <div className="mt-8 grid gap-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
          <Card className="overflow-hidden bg-[var(--fp-color-card)] border-[var(--fp-color-border)] rounded-[24px]">
            <div className="p-8 pb-6 border-b border-[var(--fp-color-border)]">
              <p className="text-[15px] font-medium text-[var(--fp-color-label)] mb-3">
                {t("pension.targetCapitalIntro", { amount: formatRub(targetMonthlySpend) })}
              </p>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-[44px] leading-none font-bold tracking-tight">{formatRub(targetCapital, { compact: true })}</span>
                <span className="text-xl font-medium text-[var(--fp-color-muted-foreground)]">₽</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[14px] font-medium text-[var(--fp-color-label)]">
                <span>{t("pension.targetYearInfo", { year: retirementYear, age: formState.retirementAge })}</span>
                <span className="text-[var(--fp-color-border-strong)]">•</span>
                <span>{t("pension.yearsToSave", { years: yearsToRetirement })}</span>
                <span className="text-[var(--fp-color-border-strong)]">•</span>
                <span>{t("pension.annualReturn", { percent: formatPercent(settings.investmentReturn) })}</span>
              </div>
            </div>
            <div className={`px-8 py-5 flex items-center gap-3 ${isCapitalSufficient ? "bg-[var(--fp-color-teal)]/10 text-[var(--fp-color-teal)]" : "bg-[var(--fp-color-orange)]/10 text-[var(--fp-color-orange)]"}`}>
              <CheckCircle2 className="size-[22px]" />
              <span className="font-semibold text-[15px]">{isCapitalSufficient ? t("pension.onTrack") : t("pension.needsAdjustment")}</span>
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Сравнение с текущими расходами */}
            <Card className="p-7 rounded-[24px] bg-[var(--fp-color-card)] border-[var(--fp-color-border)] shadow-sm">
              <h2 className="text-[17px] font-semibold mb-6">{t("pension.comparisonTitle")}</h2>
              <div className="grid gap-6">
                <div>
                  <div className="text-[14px] font-medium text-[var(--fp-color-label)] mb-1">
                    {t("pension.plannedAt", { year: retirementYear })}
                  </div>
                  <div className="text-[12px] text-[var(--fp-color-muted-foreground)] mb-3">{t("pension.withInflation")}</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight">{formatRub(futureMonthlySpend)}</span>
                    <span className="text-[15px] text-[var(--fp-color-muted-foreground)]">{t("pension.perMonthShort")}</span>
                  </div>
                  <div className="text-[14px] font-medium mt-1.5 text-[var(--fp-color-label)]">{formatRub(futureMonthlySpend * 12)} {t("pension.perYearShort")}</div>
                </div>
                
                <div className="h-px bg-[var(--fp-color-border)] w-full" />
                
                <div>
                  <div className="text-[14px] font-medium text-[var(--fp-color-label)] mb-1">
                    {t("pension.currentExpensesAt", { year: retirementYear })}
                  </div>
                  <div className="text-[12px] text-[var(--fp-color-muted-foreground)] mb-3">{t("pension.ifMaintained")}</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tracking-tight text-[var(--fp-color-label)]">{formatRub(targetMonthlySpend * 2.05)}</span>
                    <span className="text-[15px] text-[var(--fp-color-muted-foreground)]">{t("pension.perMonthShort")}</span>
                  </div>
                </div>

                <div className="mt-2 flex items-start gap-3.5 p-4 rounded-[16px] bg-[var(--fp-color-background)] border border-[var(--fp-color-border)]">
                  <Info className="size-[20px] text-[var(--fp-color-teal)] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[14px] font-semibold text-[var(--fp-color-foreground)]">{t("pension.spendLessTitle")}</p>
                    <p className="text-[13px] text-[var(--fp-color-label)] mt-1.5 leading-snug">
                      {t("pension.spendLessDesc", { percent: "49" })}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* На сколько хватит капитала? */}
            <Card className="p-8 flex flex-col justify-center text-center rounded-[24px] bg-[var(--fp-color-card)] border-[var(--fp-color-border)] shadow-sm">
              <h3 className="text-[15px] font-semibold text-[var(--fp-color-label)] mb-6">{t("pension.howLongTitle")}</h3>
              <div className="text-[56px] leading-none font-bold tracking-tight mb-4 text-[var(--fp-color-teal)]">{t("pension.hundredPlusYears")}</div>
              <p className="text-[16px] font-medium text-[var(--fp-color-foreground)]">
                {t("pension.capitalPreserved")}
              </p>
            </Card>
          </div>

          {/* Chart Section */}
          <Card className="p-7 rounded-[24px] bg-[var(--fp-color-card)] border-[var(--fp-color-border)] shadow-sm">
            <h2 className="text-[17px] font-semibold mb-2">{t("pension.chartTitle")}</h2>
            <p className="text-[14px] text-[var(--fp-color-label)] mb-8">
              {t("pension.chartSubtitle", { age: formState.retirementAge })}
            </p>
            
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCapital" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--fp-color-teal)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--fp-color-teal)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--fp-color-border)" opacity={0.5} />
                  <XAxis dataKey="age" tickLine={false} axisLine={false} tick={{ fontSize: 13, fill: 'var(--fp-color-label)' }} dy={10} />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => {
                      if (value === 0) return "0";
                      if (value >= 1e9) return `${(value / 1e9).toFixed(1)} млрд`;
                      if (value >= 1e6) return `${(value / 1e6).toFixed(1)} млн`;
                      if (value >= 1e3) return `${(value / 1e3).toFixed(0)} тыс`;
                      return String(value);
                    }} 
                    tick={{ fontSize: 13, fill: 'var(--fp-color-label)' }} 
                    width={80}
                  />
                  <RechartsTooltip 
                    formatter={(value) => [formatRub(Number(value)), t("pension.capital")]}
                    labelFormatter={(label) => t("pension.ageTooltip", { age: String(label) })}
                    contentStyle={{ borderRadius: '16px', border: '1px solid var(--fp-color-border)', backgroundColor: 'var(--fp-color-card)', boxShadow: '0 8px 32px rgba(36,31,24,0.08)', padding: '16px' }}
                    itemStyle={{ fontSize: '14px', fontWeight: 600, color: 'var(--fp-color-foreground)' }}
                    labelStyle={{ fontSize: '13px', color: 'var(--fp-color-label)', marginBottom: '4px' }}
                  />
                  <ReferenceLine x={formState.retirementAge} stroke="var(--fp-color-orange)" strokeDasharray="3 3" label={{ position: 'top', value: t("pension.pensionLine"), fill: 'var(--fp-color-orange)', fontSize: 13, fontWeight: 600, dy: -10 }} />
                  <Area type="monotone" dataKey="capital" stroke="var(--fp-color-teal)" strokeWidth={3} fillOpacity={1} fill="url(#colorCapital)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}
    </Page>
  );
}
