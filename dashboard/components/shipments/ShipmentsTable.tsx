"use client";

import { MoreVertical, Pencil, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Shipment } from "@/lib/shipments/types";
import { ShipmentStatusBadge } from "./ShipmentStatusBadge";

interface ShipmentsTableProps {
  shipments: Shipment[];
  onEdit: (s: Shipment) => void;
  onDelete: (s: Shipment) => void;
}

const thClass =
  "px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]";
const tdClass = "px-5 py-4 text-[14px] text-[#0F172A]";

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function ShipmentsTable({ shipments, onEdit, onDelete }: ShipmentsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white">
      <table className="w-full min-w-[860px] border-collapse">
        <thead>
          <tr className="border-b border-[#E2E8F0]">
            <th className={thClass}>BL Numbers</th>
            <th className={thClass}>Client</th>
            <th className={thClass}>Vessel</th>
            <th className={thClass}>Merchandise</th>
            <th className={thClass}>Arrival Date</th>
            <th className={thClass}>Status</th>
            <th className={`${thClass} text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {shipments.map((shipment) => (
            <tr
              key={shipment.id}
              className="border-b border-[#E2E8F0] last:border-b-0 hover:bg-[#F8FAFC]"
            >
              <td className={tdClass}>
                <div className="flex max-w-50 flex-wrap gap-1">
                  {shipment.blNumbers.map((bl) => (
                    <span
                      key={bl}
                      className="inline-flex items-center rounded bg-[#F1F5F9] px-2 py-0.5 text-[12px] font-medium text-[#475569]"
                    >
                      {bl}
                    </span>
                  ))}
                </div>
              </td>
              <td className={`${tdClass} font-medium`}>{shipment.clientName}</td>
              <td className={tdClass}>{shipment.vesselName}</td>
              <td className={`${tdClass} text-[#64748B]`}>{shipment.merchandiseDescription}</td>
              <td className={`${tdClass} text-[#64748B]`}>{formatDate(shipment.arrivalDate)}</td>
              <td className={tdClass}>
                <ShipmentStatusBadge value={shipment.status} />
              </td>
              <td className={`${tdClass} text-right`}>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    aria-label="Shipment actions"
                    className="-m-1 inline-flex h-7 w-7 items-center justify-center rounded-md text-[#94A3B8] transition-colors hover:bg-[#F1F5F9] hover:text-[#64748B] data-[state=open]:bg-[#F1F5F9] data-[state=open]:text-[#64748B]"
                  >
                    <MoreVertical size={16} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(shipment)}>
                      <Pencil size={15} className="text-[#475569]" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(shipment)}
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
