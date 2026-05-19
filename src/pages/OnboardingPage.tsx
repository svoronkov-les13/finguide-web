import { useState } from "react";
import { Navigate, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  Minus,
  Target,
  TrendingUp,
} from "lucide-react";
import { OnboardingSlide } from "@/components/onboarding/OnboardingSlide";
import { useI18n } from "@/i18n/I18nProvider";

const ONBOARDING_KEY = "fp.onboarding.seen";

/* ====================================================================
   Illustration mockups — styled to match the Figma onboarding visuals
   ==================================================================== */

/** Step 1: Mini dashboard preview (income/expense/savings cards + chart skeleton) */
function IllustrationDashboard() {
  const { t } = useI18n();
  const cardStyle: React.CSSProperties = {
    borderRadius: "var(--fp-radius-md)",
    border: "var(--fp-border-default)",
    background: "var(--fp-color-card)",
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  };
  const metaStyle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: "0.8px",
    textTransform: "uppercase" as const,
    color: "var(--fp-color-muted-foreground)",
  };
  const valueStyle: React.CSSProperties = {
    fontSize: 18,
    fontWeight: 700,
    color: "var(--fp-color-foreground)",
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 460,
        borderRadius: "var(--fp-radius-2xl)",
        background: "var(--fp-color-card)",
        boxShadow: "var(--fp-shadow-glass)",
        padding: 24,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {/* Top bar skeleton */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: "var(--fp-radius-sm)",
            background: "var(--fp-color-primary)",
            display: "grid",
            placeItems: "center",
            color: "var(--fp-color-accent-gold)",
          }}
        >
          <BarChart3 style={{ width: 14, height: 14 }} />
        </span>
        <div
          style={{
            width: 80,
            height: 10,
            borderRadius: "var(--fp-radius-full)",
            background: "var(--fp-color-primary)",
          }}
        />
        <div style={{ flex: 1 }} />
        <div
          style={{
            width: 60,
            height: 8,
            borderRadius: "var(--fp-radius-full)",
            background: "var(--fp-color-muted)",
          }}
        />
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <div style={cardStyle}>
          <span style={metaStyle}>{t("cashflow.income")}</span>
          <span style={valueStyle}>₽ 405 000</span>
          <span style={{ fontSize: 10, color: "var(--fp-color-muted-foreground)" }}>/мес</span>
        </div>
        <div style={cardStyle}>
          <span style={metaStyle}>{t("cashflow.expense")}</span>
          <span style={valueStyle}>₽ 178 000</span>
          <span style={{ fontSize: 10, color: "var(--fp-color-muted-foreground)" }}>/мес</span>
        </div>
        <div style={cardStyle}>
          <span style={metaStyle}>{t("chart.savings")}</span>
          <span style={valueStyle}>₽ 227 000</span>
          <span style={{ fontSize: 10, color: "var(--fp-color-muted-foreground)" }}>/мес</span>
        </div>
      </div>

      {/* Chart skeleton */}
      <div
        style={{
          borderRadius: "var(--fp-radius-md)",
          border: "var(--fp-border-default)",
          background: "var(--fp-color-card)",
          padding: "16px 16px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div
          style={{
            width: 120,
            height: 8,
            borderRadius: "var(--fp-radius-full)",
            background: "var(--fp-color-foreground)",
          }}
        />
        <svg viewBox="0 0 400 80" style={{ width: "100%", height: 60 }}>
          <path
            d="M0,60 Q100,55 200,40 T400,10"
            fill="none"
            stroke="var(--fp-color-foreground)"
            strokeWidth="2"
          />
          <path
            d="M0,65 Q100,62 200,55 T400,45"
            fill="none"
            stroke="var(--fp-color-muted-foreground)"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
        </svg>
      </div>

      {/* Callout badge */}
      <div
        style={{
          alignSelf: "flex-end",
          borderRadius: "var(--fp-radius-md)",
          border: "var(--fp-border-default)",
          background: "var(--fp-color-card)",
          padding: "10px 14px",
          textAlign: "center",
          boxShadow: "var(--fp-shadow-soft)",
        }}
      >
        <div style={{ fontSize: 9, color: "var(--fp-color-muted-foreground)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px" }}>
          Главный ответ
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--fp-color-foreground)" }}>
          ₽ 38 000 /мес
        </div>
        <div style={{ fontSize: 9, color: "var(--fp-color-muted-foreground)" }}>
          нужно откладывать
        </div>
      </div>
    </div>
  );
}

/** Step 2: Goals list (Автомобиль, Образование, Квартира) */
function IllustrationGoals() {
  const goals = [
    { name: "Автомобиль", amount: "₽ 1 200 000", year: 2029, pct: 85, monthly: "~₽ 28 000/мес", ok: true },
    { name: "Образование", amount: "₽ 2 000 000", year: 2033, pct: 62, monthly: "~₽ 22 000/мес", ok: true },
    { name: "Квартира", amount: "₽ 3 000 000", year: 2036, pct: 40, monthly: "~₽ 25 000/мес", ok: false },
  ];

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 420,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {goals.map((g) => (
        <div
          key={g.name}
          style={{
            borderRadius: "var(--fp-radius-xl)",
            border: "var(--fp-border-default)",
            background: "var(--fp-color-card)",
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            boxShadow: "var(--fp-shadow-soft)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--fp-color-foreground)" }}>
                {g.name}
              </div>
              <div style={{ fontSize: 12, color: "var(--fp-color-muted-foreground)" }}>
                {g.amount} · к {g.year}
              </div>
            </div>
            <span
              style={{
                borderRadius: "var(--fp-radius-full)",
                border: g.ok ? "var(--fp-border-default)" : "1px solid var(--fp-color-coral)",
                background: g.ok ? "transparent" : "var(--fp-color-coral-soft)",
                padding: "4px 12px",
                fontSize: 11,
                fontWeight: 600,
                color: g.ok ? "var(--fp-color-foreground)" : "var(--fp-color-coral)",
              }}
            >
              {g.ok ? "Достижима" : "Под вопросом"}
            </span>
          </div>
          {/* Progress bar */}
          <div style={{ height: 6, borderRadius: "var(--fp-radius-full)", background: "var(--fp-color-muted)" }}>
            <div
              style={{
                height: "100%",
                width: `${g.pct}%`,
                borderRadius: "var(--fp-radius-full)",
                background: "var(--fp-color-foreground)",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11,
              color: "var(--fp-color-muted-foreground)",
            }}
          >
            <span>{g.pct}% накоплено</span>
            <span>{g.monthly}</span>
          </div>
        </div>
      ))}

      {/* Total bar */}
      <div
        style={{
          borderRadius: "var(--fp-radius-xl)",
          background: "var(--fp-color-primary)",
          padding: "14px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 13, color: "var(--fp-color-sidebar-text-muted)" }}>
          Итого откладывать
        </span>
        <span style={{ fontSize: 18, fontWeight: 700, color: "var(--fp-color-sidebar-text)" }}>
          ₽ 75 000 /мес
        </span>
      </div>
    </div>
  );
}

/** Step 3: Scenario comparison (chart + three cards) */
function IllustrationScenarios() {
  const { t } = useI18n();
  const scenarios = [
    { label: "Базовый", value: "₽ 8.2 млн", year: "к 2046 году", active: true },
    { label: "Оптимистичный", value: "₽ 12.4 млн", year: "к 2046 году", active: false },
    { label: "Консервативный", value: "₽ 5.6 млн", year: "к 2046 году", active: false },
  ];

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 420,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {/* Scenario tabs */}
      <div style={{ display: "flex", gap: 8 }}>
        {scenarios.map((s) => (
          <span
            key={s.label}
            style={{
              borderRadius: "var(--fp-radius-full)",
              border: s.active ? "none" : "var(--fp-border-default)",
              background: s.active ? "var(--fp-color-primary)" : "transparent",
              color: s.active ? "var(--fp-color-primary-foreground)" : "var(--fp-color-foreground)",
              padding: "6px 16px",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {s.label}
          </span>
        ))}
      </div>

      {/* Chart card */}
      <div
        style={{
          borderRadius: "var(--fp-radius-xl)",
          border: "var(--fp-border-default)",
          background: "var(--fp-color-card)",
          padding: "18px 20px 14px",
          boxShadow: "var(--fp-shadow-soft)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--fp-color-foreground)" }}>
            Прогноз накоплений
          </span>
          <span style={{ fontSize: 11, color: "var(--fp-color-accent-gold-text)" }}>{t("onboarding.byYears")}</span>
        </div>
        <svg viewBox="0 0 360 100" style={{ width: "100%", height: 80 }}>
          <path d="M0,85 Q90,80 180,55 T360,15" fill="none" stroke="var(--fp-color-foreground)" strokeWidth="2.5" />
          <path d="M0,85 Q90,82 180,65 T360,35" fill="none" stroke="var(--fp-color-muted-foreground)" strokeWidth="1.5" strokeDasharray="5,5" />
          <path d="M0,85 Q90,83 180,72 T360,55" fill="none" stroke="var(--fp-color-muted-foreground)" strokeWidth="1" strokeDasharray="3,3" />
        </svg>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--fp-color-muted-foreground)", marginTop: 4 }}>
          <span>2026</span><span>2030</span><span>2034</span><span>2038</span><span>2042</span>
        </div>
      </div>

      {/* Scenario cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {scenarios.map((s) => (
          <div
            key={s.label}
            style={{
              borderRadius: "var(--fp-radius-md)",
              border: "var(--fp-border-default)",
              background: "var(--fp-color-card)",
              padding: "12px 10px",
              textAlign: "center",
              boxShadow: "var(--fp-shadow-soft)",
            }}
          >
            <div style={{ fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.8px", color: "var(--fp-color-muted-foreground)" }}>
              {s.label}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--fp-color-foreground)", margin: "4px 0 2px" }}>
              {s.value}
            </div>
            <div style={{ fontSize: 10, color: "var(--fp-color-muted-foreground)" }}>{s.year}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Step 4: Setup checklist (Общие данные, Доходы, Цели, Пенсия) */
function IllustrationSetup() {
  const items = [
    { icon: <BarChart3 style={{ width: 18, height: 18 }} />, title: "Общие данные", sub: "Возраст, валюта, горизонт", done: true },
    { icon: <TrendingUp style={{ width: 18, height: 18 }} />, title: "Доходы", sub: "Зарплата, фриланс, аренда", done: false },
    { icon: <Target style={{ width: 18, height: 18 }} />, title: "Цели", sub: "Квартира, авто, образование", done: false },
    { icon: <Minus style={{ width: 18, height: 18 }} />, title: "Пенсия", sub: "Желаемый возраст и доход", done: false },
  ];

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 380,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {items.map((item, i) => (
        <div
          key={item.title}
          style={{
            borderRadius: "var(--fp-radius-xl)",
            background: i === 0 ? "var(--fp-color-primary)" : "var(--fp-color-card)",
            border: i === 0 ? "none" : "var(--fp-border-default)",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            color: i === 0 ? "var(--fp-color-sidebar-text)" : "var(--fp-color-foreground)",
            boxShadow: i === 0 ? "none" : "var(--fp-shadow-soft)",
          }}
        >
          <span
            style={{
              width: 36,
              height: 36,
              borderRadius: "var(--fp-radius-md)",
              background: i === 0 ? "var(--fp-color-sidebar-soft)" : "var(--fp-color-muted)",
              display: "grid",
              placeItems: "center",
              color: i === 0 ? "var(--fp-color-accent-gold)" : "var(--fp-color-muted-foreground)",
              flexShrink: 0,
            }}
          >
            {item.icon}
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{item.title}</div>
            <div
              style={{
                fontSize: 12,
                color: i === 0 ? "var(--fp-color-sidebar-text-muted)" : "var(--fp-color-muted-foreground)",
              }}
            >
              {item.sub}
            </div>
          </div>
          {item.done ? (
            <Check style={{ width: 18, height: 18, color: "var(--fp-color-teal)" }} />
          ) : (
            <ChevronRight style={{ width: 18, height: 18, opacity: 0.4 }} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ====================================================================
   OnboardingPage
   ==================================================================== */

export function OnboardingPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const seen = (() => {
    try {
      return globalThis.localStorage?.getItem(ONBOARDING_KEY) === "true";
    } catch {
      return false;
    }
  })();

  if (seen) {
    return <Navigate to="/login" replace />;
  }

  const slides = [
    {
      label: t("onboarding.step1.label"),
      title: t("onboarding.step1.title"),
      description: t("onboarding.step1.description"),
      illustration: <IllustrationDashboard />,
    },
    {
      label: t("onboarding.step2.label"),
      title: t("onboarding.step2.title"),
      description: t("onboarding.step2.description"),
      illustration: <IllustrationGoals />,
    },
    {
      label: t("onboarding.step3.label"),
      title: t("onboarding.step3.title"),
      description: t("onboarding.step3.description"),
      illustration: <IllustrationScenarios />,
    },
    {
      label: t("onboarding.step4.label"),
      title: t("onboarding.step4.title"),
      description: t("onboarding.step4.description"),
      illustration: <IllustrationSetup />,
    },
  ];

  const isLast = step === slides.length - 1;

  const finish = () => {
    try { localStorage.setItem(ONBOARDING_KEY, "true"); } catch { /* */ }
    void navigate({ to: "/register" });
  };

  const skip = () => {
    try { localStorage.setItem(ONBOARDING_KEY, "true"); } catch { /* */ }
    void navigate({ to: "/login" });
  };

  /* --- Button inline styles (per Figma: pill-shaped) --- */
  const btnPrimary: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    height: 48,
    borderRadius: "var(--fp-radius-full)",
    border: "none",
    background: "var(--fp-color-primary)",
    color: "var(--fp-color-primary-foreground)",
    padding: "0 28px",
    fontSize: "var(--fp-text-base)",
    fontWeight: "var(--fp-weight-semibold)",
    fontFamily: "var(--fp-font-primary)",
    cursor: "pointer",
  };
  const btnSecondary: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    height: 48,
    borderRadius: "var(--fp-radius-full)",
    border: "var(--fp-border-default)",
    background: "transparent",
    color: "var(--fp-color-foreground)",
    padding: "0 24px",
    fontSize: "var(--fp-text-base)",
    fontWeight: "var(--fp-weight-medium)",
    fontFamily: "var(--fp-font-primary)",
    cursor: "pointer",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "var(--fp-color-surface)",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 64px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{
              display: "grid",
              placeItems: "center",
              width: 40,
              height: 40,
              borderRadius: "var(--fp-radius-md)",
              background: "var(--fp-color-primary)",
              color: "var(--fp-color-accent-gold)",
            }}
          >
            <BarChart3 style={{ width: 18, height: 18 }} />
          </span>
          <span
            style={{
              fontSize: "var(--fp-text-lg)",
              fontWeight: "var(--fp-weight-bold)",
              color: "var(--fp-color-foreground)",
            }}
          >
            FinPlan
          </span>
        </div>

        <button
          onClick={skip}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "var(--fp-text-sm)",
            fontWeight: "var(--fp-weight-medium)",
            color: "var(--fp-color-muted-foreground)",
            fontFamily: "var(--fp-font-primary)",
          }}
          type="button"
        >
          {t("onboarding.skip")}
        </button>
      </header>

      {/* Slide */}
      <OnboardingSlide
        description={slides[step].description}
        illustration={slides[step].illustration}
        label={slides[step].label}
        stepIndex={step}
        title={slides[step].title}
        totalSteps={slides.length}
      />

      {/* Bottom nav — dots left, buttons next to them (per Figma) */}
      <footer
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          padding: "20px 64px 28px",
        }}
      >
        {/* Dots */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {slides.map((_, i) => (
            <button
              aria-label={`Step ${i + 1}`}
              key={i}
              onClick={() => setStep(i)}
              style={{
                width: i === step ? 28 : 8,
                height: 8,
                borderRadius: "var(--fp-radius-full)",
                background: i === step ? "var(--fp-color-primary)" : "var(--fp-color-border)",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "width var(--fp-duration-normal) var(--fp-easing-default)",
              }}
              type="button"
            />
          ))}
        </div>

        {/* Back button */}
        {step > 0 && (
          <button onClick={() => setStep((s) => s - 1)} style={btnSecondary} type="button">
            <ArrowLeft style={{ width: 16, height: 16 }} />
            {t("onboarding.back")}
          </button>
        )}

        {/* Next / Create Plan */}
        {isLast ? (
          <button onClick={finish} style={btnPrimary} type="button">
            {t("onboarding.createPlan")}
            <ArrowRight style={{ width: 16, height: 16 }} />
          </button>
        ) : (
          <button onClick={() => setStep((s) => s + 1)} style={btnPrimary} type="button">
            {t("onboarding.next")}
            <ArrowRight style={{ width: 16, height: 16 }} />
          </button>
        )}
      </footer>
    </div>
  );
}
