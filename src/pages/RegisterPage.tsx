import { ArrowRight, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import type React from "react";
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
  const [showPassword, setShowPassword] = useState(false);

  if (auth.authenticated && auth.enabled) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = () => {
    window.location.assign(auth.registrationUrl);
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
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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
              placeholder={t("auth.register.firstNamePlaceholder")}
              style={inputPlainStyle}
              type="text"
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
              placeholder={t("auth.register.lastNamePlaceholder")}
              style={inputPlainStyle}
              type="text"
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
              placeholder={t("auth.register.emailPlaceholder")}
              style={inputStyle}
              type="email"
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
              placeholder={t("auth.register.passwordPlaceholder")}
              style={inputPasswordStyle}
              type={showPassword ? "text" : "password"}
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

        {/* Submit — pill button */}
        <button
          onClick={handleSubmit}
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
            cursor: "pointer",
            transition: "opacity var(--fp-duration-normal) var(--fp-easing-default)",
          }}
          type="button"
        >
          {t("auth.register.submit")}
          <ArrowRight style={{ width: 18, height: 18 }} />
        </button>
      </div>

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
