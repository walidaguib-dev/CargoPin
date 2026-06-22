"use client";

import { MoreVertical, Pencil, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Vessel } from "@/lib/vessels/types";
import { VesselStatusBadge } from "./VesselStatusBadge";

interface VesselsTableProps {
  vessels: Vessel[];
  onEdit: (v: Vessel) => void;
  onDelete: (v: Vessel) => void;
}

const thClass =
  "px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]";
const tdClass = "px-5 py-4 text-[14px] text-[#0F172A]";

export function VesselsTable({ vessels, onEdit, onDelete }: VesselsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white">
      <table className="w-full min-w-[640px] border-collapse">
        <thead>
          <tr className="border-b border-[#E2E8F0]">
            <th className={thClass}>Name</th>
            <th className={thClass}>IMO Number</th>
            <th className={thClass}>Status</th>
            <th className={`${thClass} text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vessels.map((vessel) => (
            <tr
              key={vessel.id}
              className="border-b border-[#E2E8F0] last:border-b-0 hover:bg-[#F8FAFC]"
            >
              <td className={`${tdClass} font-medium`}>{vessel.name}</td>
              <td className={`${tdClass} text-[#64748B]`}>
                {vessel.imoNumber ?? "—"}
              </td>
              <td className={tdClass}>
                <VesselStatusBadge value={vessel.status} />
              </td>
              <td className={`${tdClass} text-right`}>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    aria-label="Vessel actions"
                    className="-m-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-[#94A3B8] transition-colors hover:bg-[#F1F5F9] hover:text-[#64748B] data-[state=open]:bg-[#F1F5F9] data-[state=open]:text-[#64748B]"
                  >
                    <MoreVertical size={16} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(vessel)}>
                      <Pencil size={15} className="text-[#475569]" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(vessel)}
                      className="text-[#DC2626] focus:bg-[#FEF2F2] focus:text-[#DC2626]"
                    >
                      <Trash2 size={15} />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
