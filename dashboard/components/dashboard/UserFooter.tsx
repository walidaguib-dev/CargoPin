"use client";

import Link from "next/link";
import { LogOut, MoreHorizontal, User } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/auth";

interface UserFooterProps {
  name: string;
  role: string;
  initials: string;
}

export function UserFooter({ name, role, initials }: UserFooterProps) {
  return (
    <div className="border-t border-[#F1F5F9] p-3">
      <div className="flex items-center gap-2.5 rounded-lg p-1.5">
        <div
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold uppercase tracking-wide text-white"
          style={{
            background: "linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)",
          }}
        >
          {initials}
        </div>
        <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
          <div className="max-w-full truncate text-[13px] font-semibold leading-none text-[#0F172A]">
            {name}
          </div>
          <span className="rounded px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider leading-tight bg-[#DBEAFE] text-[#1D4ED8]">
            {role}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Open user menu"
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#64748B] transition-colors hover:bg-[#F1F5F9] data-[state=open]:bg-[#F1F5F9]"
          >
            <MoreHorizontal size={18} />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="top"
            sideOffset={8}
            className="w-48"
          >
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer">
                <User size={15} className="text-[#475569]" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-[#DC2626] focus:bg-[#FEF2F2] focus:text-[#DC2626]"
            >
              <LogOut size={15} />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
