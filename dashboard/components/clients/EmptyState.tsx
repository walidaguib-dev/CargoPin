"use client";

import { Users, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onCreate: () => void;
}

export function EmptyState({ onCreate }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Users size={48} className="text-[#CBD5E1]" />
      <h2 className="mt-4 text-[16px] font-semibold text-[#0F172A]">
        No clients yet
      </h2>
      <p className="mt-1 text-[14px] text-[#64748B]">
        Add your first client to get started
      </p>
      <Button
        type="button"
        onClick={onCreate}
        className="mt-6 h-10 gap-1.5 rounded-xl bg-[#0EA5E9] px-4 text-[14px] font-semibold text-white hover:bg-[#0284C7]"
      >
        <Plus size={16} />
        New Client
      </Button>
    </div>
  );
}
