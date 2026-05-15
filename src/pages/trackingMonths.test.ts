import { describe, expect, it } from "vitest";
import { makeEmptyYear, shouldShowEmptyAmountPlaceholder } from "@/pages/trackingMonths";

describe("makeEmptyYear", () => {
  it("marks past months in the current year as missed by default", () => {
    const months = makeEmptyYear(2026, 2026, 4);

    expect(months[0].status).toBe("missed");
    expect(months[3].status).toBe("missed");
    expect(months[4].status).toBe("current");
    expect(months[5].status).toBe("pending");
  });

  it("marks months from previous years as missed by default", () => {
    const months = makeEmptyYear(2025, 2026, 4);

    expect(months.every((month) => month.status === "missed")).toBe(true);
  });

  it("does not show an extra placeholder for pending months because the status label already says ahead", () => {
    expect(shouldShowEmptyAmountPlaceholder("pending")).toBe(false);
  });
});
