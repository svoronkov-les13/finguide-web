import type { ReactNode } from "react";
import { useI18n } from "@/i18n/I18nProvider";

interface OnboardingSlideProps {
  stepIndex: number;
  totalSteps: number;
  label: string;
  title: string;
  description: string;
  illustration: ReactNode;
}

export function OnboardingSlide({
  stepIndex,
  totalSteps,
  label,
  title,
  description,
  illustration,
}: OnboardingSlideProps) {
  const { t } = useI18n();

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        flex: 1,
        minHeight: 0,
      }}
    >
      {/* --- Left: text content --- */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 24,
          padding: "40px 64px",
        }}
      >
        {/* Step pill tag — per Figma: rounded bg pill with "ШАГ X ИЗ Y · Label" */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              borderRadius: "var(--fp-radius-full)",
              background: "var(--fp-color-muted)",
              padding: "6px 14px",
              fontSize: "var(--fp-text-xs)",
              fontWeight: "var(--fp-weight-semibold)",
              letterSpacing: "var(--fp-tracking-wide)",
              color: "var(--fp-color-foreground)",
              textTransform: "uppercase" as const,
            }}
          >
            {t("onboarding.stepOf", {
              current: String(stepIndex + 1),
              total: String(totalSteps),
            })}
            <span style={{ color: "var(--fp-color-muted-foreground)" }}>·</span>
            <span style={{ textTransform: "capitalize" as const, letterSpacing: 0 }}>
              {label}
            </span>
          </span>
        </div>

        {/* Title — large, bold */}
        <h2
          style={{
            fontSize: 36,
            fontWeight: "var(--fp-weight-bold)",
            lineHeight: "var(--fp-leading-tight)",
            letterSpacing: "var(--fp-tracking-tight)",
            color: "var(--fp-color-foreground)",
            margin: 0,
            maxWidth: 420,
          }}
        >
          {title}
        </h2>

        {/* Description */}
        <p
          style={{
            maxWidth: 420,
            fontSize: "var(--fp-text-base)",
            lineHeight: "var(--fp-leading-relaxed)",
            color: "var(--fp-color-muted-foreground)",
            margin: 0,
          }}
        >
          {description}
        </p>
      </div>

      {/* --- Right: illustration area --- */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
        }}
      >
        {illustration}
      </div>
    </div>
  );
}
