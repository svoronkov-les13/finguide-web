import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/layout/Page";
import { cn } from "@/lib/utils";

interface DataPanelProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function DataPanel({ title, description, actions, children, className, contentClassName }: DataPanelProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      {(title || description || actions) && (
        <div className="border-b border-border/70 px-5 py-4">
          <SectionHeader title={title ?? ""} description={description} actions={actions} />
        </div>
      )}
      <div className={cn("p-4", contentClassName)}>{children}</div>
    </Card>
  );
}

export function SurfaceRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-[22px] border border-border/75 bg-surface/35 p-4 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset]", className)}>{children}</div>;
}
