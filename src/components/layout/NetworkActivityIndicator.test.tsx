// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("NetworkActivityIndicator", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    vi.useFakeTimers();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.useRealTimers();
  });

  it("appears only after a short delay to avoid flicker", async () => {
    const { NetworkActivityIndicator } = await import("@/components/layout/NetworkActivityIndicator");

    await act(async () => {
      root.render(<NetworkActivityIndicator active label="Обновляем данные" />);
    });

    expect(container.querySelector("[data-network-activity]")).toBeNull();

    await act(async () => {
      vi.advanceTimersByTime(250);
    });

    expect(container.querySelector("[data-network-activity]")?.getAttribute("aria-label")).toBe("Обновляем данные");
  });

  it("hides immediately when activity stops", async () => {
    const { NetworkActivityIndicator } = await import("@/components/layout/NetworkActivityIndicator");

    await act(async () => {
      root.render(<NetworkActivityIndicator active label="Обновляем данные" />);
    });
    await act(async () => {
      vi.advanceTimersByTime(250);
    });
    expect(container.querySelector("[data-network-activity]")).not.toBeNull();

    act(() => {
      root.render(<NetworkActivityIndicator active={false} label="Обновляем данные" />);
    });

    expect(container.querySelector("[data-network-activity]")).toBeNull();
  });
});
