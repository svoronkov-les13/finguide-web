import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="grid h-screen grid-cols-[var(--sidebar-width)_minmax(0,1fr)] overflow-hidden [--sidebar-width:260px] max-[1120px]:[--sidebar-width:72px] max-[760px]:h-auto max-[760px]:min-h-screen">
      <Sidebar />
      <div className="min-w-0 overflow-hidden">
        <Topbar />
        <main className="scrollbar-thin h-[calc(100vh-52px)] overflow-auto px-6 py-10 max-[760px]:h-auto max-[760px]:overflow-visible max-[760px]:px-4 max-[760px]:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
