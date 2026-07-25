import { apiBaseUrl } from "@/shared/api/baseUrl";

export async function requestPasswordReset(email: string) {
  const response = await fetch(`${apiBaseUrl}/auth/password/forgot`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || `Password reset request failed with HTTP ${response.status}`);
  }
}
