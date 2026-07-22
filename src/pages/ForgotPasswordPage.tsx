import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import { requestPasswordReset } from "@/auth/passwordReset";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { useI18n } from "@/i18n/I18nProvider";

const inputStyle: React.CSSProperties = {
  height: 48,
  width: "100%",
  borderRadius: 16,
  border: "1px solid var(--fp-color-border)",
  background: "var(--fp-color-input)",
  paddingLeft: 44,
  paddingRight: 16,
  fontSize: "var(--fp-text-sm)",
  color: "var(--fp-color-foreground)",
  outline: "none",
  transition: "border-color var(--fp-duration-normal) var(--fp-easing-default), box-shadow var(--fp-duration-normal) var(--fp-easing-default)",
  fontFamily: "var(--fp-font-primary)",
};

const labelStyle: React.CSSProperties = {
  fontSize: "var(--fp-text-sm)",
  fontWeight: "var(--fp-weight-medium)",
  color: "var(--fp-color-label)",
};

const iconLeftStyle: React.CSSProperties = {
  position: "absolute",
  left: 16,
  top: "50%",
  transform: "translateY(-50%)",
  width: 18,
  height: 18,
  color: "var(--fp-color-muted-foreground)",
};

export function ForgotPasswordPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const submittedEmail = new FormData(form).get("email")?.toString() ?? email;
    setError("");
    setLoading(true);

    try {
      await requestPasswordReset(submittedEmail);
      setSent(true);
    } catch {
      setError(t("auth.forgot.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <h1
          style={{
            fontSize: "var(--fp-text-3xl)",
            fontWeight: "var(--fp-weight-bold)",
            letterSpacing: "var(--fp-tracking-tight)",
            color: "var(--fp-color-foreground)",
            margin: 0,
          }}
        >
          {sent ? t("auth.forgot.successTitle") : t("auth.forgot.title")}
        </h1>
        <p
          style={{
            fontSize: "var(--fp-text-base)",
            color: "var(--fp-color-muted-foreground)",
            margin: 0,
          }}
        >
          {sent ? t("auth.forgot.successDescription") : t("auth.forgot.subtitle")}
        </p>
      </div>

      {sent ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderRadius: "var(--fp-radius-xl)",
            border: "1px solid var(--fp-color-border)",
            background: "var(--fp-color-card)",
            padding: 16,
            color: "var(--fp-color-foreground)",
          }}
        >
          <CheckCircle2 style={{ width: 22, height: 22, color: "var(--fp-color-success)" }} />
          <span style={{ fontSize: "var(--fp-text-sm)" }}>{t("auth.forgot.successTitle")}</span>
        </div>
      ) : (
        <form onSubmit={(event) => void handleSubmit(event)} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="forgot-password-email" style={labelStyle}>
              {t("auth.forgot.email")}
            </label>
            <div style={{ position: "relative" }}>
              <Mail style={iconLeftStyle} />
              <input
                autoComplete="email"
                disabled={loading}
                id="forgot-password-email"
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t("auth.forgot.emailPlaceholder")}
                required
                style={inputStyle}
                type="email"
                value={email}
              />
            </div>
          </div>

          {error && (
            <p
              style={{
                margin: 0,
                borderRadius: "var(--fp-radius-md)",
                background: "var(--fp-color-danger-soft)",
                padding: "10px 14px",
                fontSize: "var(--fp-text-sm)",
                color: "var(--fp-color-danger)",
              }}
            >
              {error}
            </p>
          )}

          <button
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              height: 48,
              width: "100%",
              borderRadius: 16,
              border: "none",
              background: "var(--fp-color-primary)",
              color: "var(--fp-color-primary-foreground)",
              fontSize: "var(--fp-text-base)",
              fontWeight: "var(--fp-weight-semibold)",
              fontFamily: "var(--fp-font-primary)",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.5 : 1,
              transition: "opacity var(--fp-duration-normal) var(--fp-easing-default)",
            }}
            type="submit"
          >
            {loading ? (
              <>
                <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} />
                {t("auth.forgot.sending")}
              </>
            ) : (
              t("auth.forgot.submit")
            )}
          </button>
        </form>
      )}

      <Link
        to="/login"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          color: "var(--fp-color-muted-foreground)",
          fontSize: "var(--fp-text-sm)",
          fontWeight: "var(--fp-weight-medium)",
          textDecoration: "none",
        }}
      >
        <ArrowLeft style={{ width: 16, height: 16 }} />
        {t("auth.forgot.backToLogin")}
      </Link>
    </AuthLayout>
  );
}
