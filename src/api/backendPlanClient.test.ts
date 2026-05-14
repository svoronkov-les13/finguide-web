// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { trackerEntryFromApi, trackerEntryRequest } from "@/api/backendPlanClient";
import type { TrackerEntry } from "@/types/finance";

describe("backendPlanClient tracker journal mapping", () => {
  it("maps UI tracker entries to backend journal requests", () => {
    const entry: Omit<TrackerEntry, "id"> = {
      date: "2026-05-14",
      title: "Кофе",
      amount: -350,
      type: "expense",
      status: "actual",
    };

    expect(trackerEntryRequest(entry)).toEqual({
      date: "2026-05-14",
      title: "Кофе",
      amount: -350,
      type: "expense",
      status: "actual",
    });
  });

  it("maps backend journal entries back to UI tracker entries", () => {
    expect(trackerEntryFromApi({
      id: "entry-1",
      date: "2026-05-14",
      title: "Кофе",
      amount: -350,
      type: "expense",
      status: "actual",
    })).toEqual({
      id: "entry-1",
      date: "2026-05-14",
      title: "Кофе",
      amount: -350,
      type: "expense",
      status: "actual",
    });
  });
});
