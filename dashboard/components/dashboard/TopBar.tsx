"use client";

import { Bell, Menu } from "lucide-react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";

interface TopBarProps {
  hasUnread?: boolean;
  userInitials: string;
}

export function TopBar({ hasUnread = true, userInitials }: TopBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-[#E2E8F0] bg-white px-5">
      <div className="flex items-center">
        <Sheet>
          <SheetTrigger
            aria-label="Open navigation"
            className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-[#F1F5F9] lg:hidden"
          >
            <Menu size={20} color="#475569" />
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>
        <button
          type="button"
          aria-label="Collapse sidebar"
          className="hidden h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-[#F1F5F9] lg:flex"
        >
          <Menu size={20} color="#475569" />
        </button>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-[#F1F5F9]"
        >
          <Bell size={18} color="#64748B" />
          {hasUnread ? (
            <span
              aria-hidden="true"
              className="absolute right-[9px] top-[8px] h-[7px] w-[7px] rounded-full bg-[#EF4444] ring-[1.5px] ring-white"
            />
          ) : null}
        </button>
        <button
          type="button"
          aria-label="Account menu"
          className="ml-1 flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold uppercase tracking-wide text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9]"
          style={{
            background: "linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)",
          }}
        >
          {userInitials}
        </button>
      </div>
    </header>
  );
}
