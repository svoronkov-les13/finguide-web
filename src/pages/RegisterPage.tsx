import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import type React from "react";
import type { FormEvent } from "react";
import { useState } from "react";
import { Link, Navigate } from "@tanstack/react-router";
import { useAuth } from "@/auth/AuthProvider";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { useI18n } from "@/i18n/I18nProvider";

/* ---- Shared inline styles (DRY — same as LoginPage) ---- */

const inputStyle: React.CSSProperties = {
  height: 52,
  width: "100%",
  borderRadius: "var(--fp-radius-full)",
  border: "none",
  background: "var(--fp-color-muted)",
  paddingLeft: 44,
  paddingRight: 16,
  fontSize: "var(--fp-text-base)",
  color: "var(--fp-color-foreground)",
  outline: "none",
  transition: "box-shadow var(--fp-duration-normal) var(--fp-easing-default)",
  fontFamily: "var(--fp-font-primary)",
};

const inputPlainStyle: React.CSSProperties = {
  ...inputStyle,
  paddingLeft: 16,
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

export function RegisterPage() {
  const auth = useAuth();
  const { t } = useI18n();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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
      await auth.registerWithCredentials({ firstName, lastName, email, password });
      window.location.assign(
        (import.meta.env.VITE_FINGUIDE_BASE_PATH?.replace(/\/$/, "") || "") + "/dashboard",
      );
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : t("auth.register.error"));
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
          {t("auth.register.title")}
        </h1>
        <p
          style={{
            fontSize: "var(--fp-text-base)",
            color: "var(--fp-color-muted-foreground)",
            margin: 0,
          }}
        >
          {t("auth.register.subtitle")}
        </p>
      </div>

      {/* Form fields */}
      <form
        onSubmit={(e) => void handleSubmit(e)}
        style={{ display: "flex", flexDirection: "column", gap: 20 }}
      >
        {/* Name row — two columns */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* First name */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="reg-first-name" style={labelStyle}>
              {t("auth.register.firstName")}
            </label>
            <input
              autoComplete="given-name"
              id="reg-first-name"
              onChange={(e) => setFirstName(e.target.value)}
              placeholder={t("auth.register.firstNamePlaceholder")}
              required
              style={inputPlainStyle}
              type="text"
              value={firstName}
            />
          </div>

          {/* Last name */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label htmlFor="reg-last-name" style={labelStyle}>
              {t("auth.register.lastName")}
            </label>
            <input
              autoComplete="family-name"
              id="reg-last-name"
              onChange={(e) => setLastName(e.target.value)}
              placeholder={t("auth.register.lastNamePlaceholder")}
              required
              style={inputPlainStyle}
              type="text"
              value={lastName}
            />
          </div>
        </div>

        {/* Email */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="reg-email" style={labelStyle}>
            {t("auth.register.email")}
          </label>
          <div style={{ position: "relative" }}>
            <Mail style={iconLeftStyle} />
            <input
              autoComplete="email"
              id="reg-email"
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("auth.register.emailPlaceholder")}
              required
              style={inputStyle}
              type="email"
              value={email}
            />
          </div>
        </div>

        {/* Password */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label htmlFor="reg-password" style={labelStyle}>
            {t("auth.register.password")}
          </label>
          <div style={{ position: "relative" }}>
            <Lock style={iconLeftStyle} />
            <input
              autoComplete="new-password"
              id="reg-password"
              minLength={8}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("auth.register.passwordPlaceholder")}
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
            height: 52,
            width: "100%",
            borderRadius: "var(--fp-radius-full)",
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
              {t("auth.register.submit")}
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
        {t("auth.register.hasAccount")}{" "}
        <Link
          to="/login"
          style={{
            fontWeight: "var(--fp-weight-semibold)",
            color: "var(--fp-color-foreground)",
            textDecoration: "none",
          }}
        >
          {t("auth.register.login")}
        </Link>
      </p>
    </AuthLayout>
  );
}
