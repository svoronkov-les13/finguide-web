import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  detail?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function MetricCard({ label, value, detail, icon, className }: MetricCardProps) {
  return (
    <Card className={cn("min-h-[114px] p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-[0.1em] text-label">{label}</div>
          <div className="mt-3 text-[22px] font-bold leading-none text-foreground">{value}</div>
        </div>
        {icon && <div className="grid size-8 shrink-0 place-items-center rounded-full border border-border/80 bg-card/80 text-muted-foreground shadow-soft">{icon}</div>}
      </div>
      {detail && <div className="mt-3 text-xs leading-5 text-muted-foreground">{detail}</div>}
    </Card>
  );
}

export function MetricsGrid({ children, columns = 3 }: { children: ReactNode; columns?: 3 | 4 }) {
  return <div className={cn("grid gap-3", columns === 4 ? "md:grid-cols-4" : "md:grid-cols-3")}>{children}</div>;
}
