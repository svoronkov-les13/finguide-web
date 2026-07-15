import { useState, type FormEvent } from "react";
import { Link, Navigate } from "@tanstack/react-router";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { useI18n } from "@/i18n/I18nProvider";

/* ---- Shared inline styles (DRY) ---- */

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

const inputPasswordStyle: React.CSSProperties = {
  ...inputStyle,
  paddingRight: 44,
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

export function LoginPage() {
  const auth = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (auth.authenticated && auth.enabled) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!auth.enabled) {
        await auth.login("/dashboard");
        return;
      }
      await auth.loginWithCredentials(email, password);
      window.location.assign(
        (import.meta.env.VITE_FINGUIDE_BASE_PATH?.replace(/\/$/, "") || "") + "/dashboard",
      );
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : t("auth.login.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* Title block */}
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
          {t("auth.login.title")}
        </h1>
        <p
          style={{
            fontSize: "var(--fp-text-base)",
            color: "var(--fp-color-muted-foreground)",
            margin: 0,
          }}
        >
          {t("auth.login.subtitle")}
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={(e) => void handleSubmit(e)}
        style={{ display: "flex", flexDirection: "column", gap: 20 }}
      >
        {/* Email */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="login-email" style={labelStyle}>
            {t("auth.login.email")}
          </label>
          <div style={{ position: "relative" }}>
            <Mail style={iconLeftStyle} />
            <input
              autoComplete="email"
              id="login-email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.login.emailPlaceholder")}
              required
              style={inputStyle}
              type="email"
              value={email}
            />
          </div>
        </div>

        {/* Password */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="login-password" style={labelStyle}>
            {t("auth.login.password")}
          </label>
          <div style={{ position: "relative" }}>
            <Lock style={iconLeftStyle} />
            <input
              autoComplete="current-password"
              id="login-password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth.login.passwordPlaceholder")}
              required
              style={inputPasswordStyle}
              type={showPassword ? "text" : "password"}
              value={password}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                color: "var(--fp-color-muted-foreground)",
                transition: "color var(--fp-duration-fast) var(--fp-easing-default)",
              }}
              tabIndex={-1}
              type="button"
            >
              {showPassword ? (
                <EyeOff style={{ width: 18, height: 18 }} />
              ) : (
                <Eye style={{ width: 18, height: 18 }} />
              )}
            </button>
          </div>
        </div>

        {/* Error message */}
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

        {/* Submit — pill button */}
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
            <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} />
          ) : (
            <>
              {t("auth.login.submit")}
              <ArrowRight style={{ width: 18, height: 18 }} />
            </>
          )}
        </button>
      </form>

      {/* Footer link */}
      <p
        style={{
          textAlign: "center",
          fontSize: "var(--fp-text-sm)",
          color: "var(--fp-color-muted-foreground)",
          margin: 0,
        }}
      >
        {t("auth.login.noAccount")}{" "}
        <Link
          to="/register"
          style={{
            fontWeight: "var(--fp-weight-semibold)",
            color: "var(--fp-color-foreground)",
            textDecoration: "none",
          }}
        >
          {t("auth.login.register")}
        </Link>
      </p>

      {/* OIDC disabled notice */}
      {!auth.enabled && (
        <p
          style={{
            borderRadius: "var(--fp-radius-xl)",
            border: "1px dashed var(--fp-color-border)",
            background: "var(--fp-color-card)",
            padding: "12px 16px",
            textAlign: "center",
            fontSize: "var(--fp-text-xs)",
            color: "var(--fp-color-muted-foreground)",
            margin: 0,
          }}
        >
          {t("auth.login.oidcDisabled")}
        </p>
      )}
    </AuthLayout>
  );
}
