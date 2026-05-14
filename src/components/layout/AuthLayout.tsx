import { BarChart3 } from "lucide-react";
import type { ReactNode } from "react";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Shared two-column layout for auth screens (Login, Register).
 * Left: children (form content) on cream bg. Right: dark promo panel with rounded corner.
 * On mobile (<1024px) the promo panel is hidden.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  const { t } = useI18n();

  return (
    <div className="grid min-h-screen bg-[var(--fp-color-surface)] lg:grid-cols-[1fr_minmax(380px,42%)]">
      {/* --- Left: Form area --- */}
      <main className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-[520px]" style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <span
              style={{
                display: "grid",
                placeItems: "center",
                width: 44,
                height: 44,
                borderRadius: "var(--fp-radius-md)",
                background: "var(--fp-color-primary)",
                color: "var(--fp-color-accent-gold)",
              }}
            >
              <BarChart3 style={{ width: 22, height: 22 }} />
            </span>
            <span
              style={{
                fontSize: "var(--fp-text-xl)",
                fontWeight: "var(--fp-weight-bold)",
                letterSpacing: "var(--fp-tracking-snug)",
                color: "var(--fp-color-foreground)",
              }}
            >
              {t("auth.brandName")}
            </span>
          </div>

          {children}
        </div>
      </main>

      {/* --- Right: Promo panel (rounded top-left corner per Figma) --- */}
      <aside
        style={{
          display: "none",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "24px",
          background: "var(--fp-color-primary)",
          borderTopLeftRadius: "var(--fp-radius-2xl)",
          borderBottomLeftRadius: "var(--fp-radius-2xl)",
          padding: "48px 40px",
          textAlign: "center",
        }}
        className="lg:!flex"
      >
        {/* Icon */}
        <span
          style={{
            display: "grid",
            placeItems: "center",
            width: 72,
            height: 72,
            borderRadius: "var(--fp-radius-xl)",
            background: "var(--fp-color-sidebar-soft)",
            color: "var(--fp-color-accent-gold)",
          }}
        >
          <BarChart3 style={{ width: 36, height: 36 }} />
        </span>

        {/* Heading */}
        <h2
          style={{
            maxWidth: 380,
            fontSize: "var(--fp-text-2xl)",
            fontWeight: "var(--fp-weight-bold)",
            lineHeight: "var(--fp-leading-tight)",
            color: "var(--fp-color-sidebar-text)",
          }}
        >
          {t("auth.promoTitle")}
        </h2>

        {/* Description */}
        <p
          style={{
            maxWidth: 380,
            fontSize: "var(--fp-text-sm)",
            lineHeight: "var(--fp-leading-relaxed)",
            color: "var(--fp-color-sidebar-text-muted)",
          }}
        >
          {t("auth.promoDescription")}
        </p>
      </aside>
    </div>
  );
}
