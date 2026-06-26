import type { ReactNode } from "react";

import { AuthGuard } from "@/components/dashboard/AuthGuard";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { SignalRProvider } from "@/context/SignalRContext";
import { Inter } from "next/font/google";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SignalRProvider>
      <div
        className={`flex  antialiased h-screen w-full overflow-hidden bg-[#F8FAFC] text-[#0F172A]`}
      >
        <div className="hidden lg:flex">
          <Sidebar />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar userInitials="WB" />
          <main className="flex-1 overflow-auto bg-[#F8FAFC] p-8">
            <AuthGuard>{children}</AuthGuard>
          </main>
        </div>
      </div>
    </SignalRProvider>
  );
}
