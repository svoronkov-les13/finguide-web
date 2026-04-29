import { describe, expect, it } from "vitest";
import { apiBaseUrl, demoBearerToken } from "@/shared/api/baseUrl";

describe("api base URL", () => {
  it("defaults to the deployed real backend without sending a mock bearer token", () => {
    expect(apiBaseUrl).toBe("/finguide-api/api/v1");
    expect(demoBearerToken).toBeUndefined();
  });
});
