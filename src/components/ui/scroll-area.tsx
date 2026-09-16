import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Scroll container with the hidden native scrollbar and the same slim pill
 * thumb used by the cashflow columns. Wheel/touch scrolling keeps working;
 * the thumb is a passive indicator.
 */
/** Vertical inset of the thumb track, so the pill never touches rounded corners. */
const TRACK_INSET = 8;

export function ScrollArea({
  className,
  viewportClassName,
  contentClassName,
  autoHide = false,
  fadeColor = "var(--fp-color-card)",
  children,
}: {
  className?: string;
  viewportClassName?: string;
  contentClassName?: string;
  /** Show the thumb only while scrolling instead of permanently. */
  autoHide?: boolean;
  /** Background the edge fades dissolve into; match the container background. */
  fadeColor?: string;
  children: React.ReactNode;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [thumb, setThumb] = useState<{ height: number; top: number } | null>(null);
  const [edges, setEdges] = useState({ top: false, bottom: false });
  const [scrolling, setScrolling] = useState(false);

  const measureThumb = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight <= clientHeight + 1) {
      setThumb(null);
      setEdges({ top: false, bottom: false });
      return;
    }
    const trackHeight = Math.max(0, clientHeight - TRACK_INSET * 2);
    const height = Math.max(trackHeight * (clientHeight / scrollHeight), 24);
    const top = (scrollTop / (scrollHeight - clientHeight)) * (trackHeight - height);
    setThumb({ height, top });
    setEdges({
      top: scrollTop > 2,
      bottom: scrollTop + clientHeight < scrollHeight - 2,
    });
  }, []);

  const handleScroll = useCallback(() => {
    measureThumb();
    if (!autoHide) return;
    setScrolling(true);
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setScrolling(false), 800);
  }, [autoHide, measureThumb]);

  useEffect(() => {
    measureThumb();
    // let layout and children settle before the first accurate measure
    const timer = setTimeout(measureThumb, 50);
    const observer = new ResizeObserver(measureThumb);
    if (viewportRef.current) observer.observe(viewportRef.current);
    if (contentRef.current) observer.observe(contentRef.current);
    return () => {
      clearTimeout(timer);
      clearTimeout(idleTimer.current);
      observer.disconnect();
    };
  }, [measureThumb]);

  return (
    <div className={cn("relative min-h-0", className)}>
      <div
        ref={viewportRef}
        onScroll={handleScroll}
        className={cn("h-full overflow-y-auto hide-scrollbar", viewportClassName)}
      >
        <div ref={contentRef} className={cn("flex min-h-full flex-col", contentClassName)}>
          {children}
        </div>
      </div>
      {edges.top && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-12"
          style={{ background: `linear-gradient(to bottom, ${fadeColor} 35%, transparent)` }}
        />
      )}
      {edges.bottom && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-12"
          style={{ background: `linear-gradient(to top, ${fadeColor} 35%, transparent)` }}
        />
      )}
      {thumb && (
        <div className="pointer-events-none absolute bottom-2 right-1 top-2 w-1">
          <div
            className={cn(
              "w-full rounded-full bg-[var(--fp-color-border-strong)] transition-opacity duration-300",
              autoHide && !scrolling ? "opacity-0" : "opacity-60",
            )}
            style={{ height: `${thumb.height}px`, transform: `translateY(${thumb.top}px)` }}
          />
        </div>
      )}
    </div>
  );
}
