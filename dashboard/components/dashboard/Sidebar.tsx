"use client";

import { Brand } from "./Brand";
import { SidebarNav } from "./SidebarNav";
import { UserFooter } from "./UserFooter";

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-[#E2E8F0] bg-white">
      <div className="border-b border-[#F1F5F9] px-5 pb-6 pt-7">
        <Brand />
      </div>
      <SidebarNav onNavigate={onNavigate} />
      <UserFooter name="Walid Bensalem" role="Supervisor" initials="WB" />
    </aside>
  );
}
