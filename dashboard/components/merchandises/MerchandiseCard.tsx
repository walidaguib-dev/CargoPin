"use client";

import Link from "next/link";
import { MoreVertical, Eye, Pencil, Trash2 } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Merchandise } from "@/lib/merchandises/types";
import { CargoTypeBadge } from "./CargoTypeBadge";

interface MerchandiseCardProps {
  merchandise: Merchandise;
  onEdit: (m: Merchandise) => void;
  onDelete: (m: Merchandise) => void;
}

export function MerchandiseCard({
  merchandise,
  onEdit,
  onDelete,
}: MerchandiseCardProps) {
  const { id, description, cargoType, weight, numberOfHeat, note } =
    merchandise;

  return (
    <Link
      href={`/merchandises/${id}`}
      className="group block min-h-45 rounded-xl border border-[#E2E8F0] bg-white p-5 transition-all duration-150 hover:border-[#CBD5E1] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)]"
    >
      <div className="flex items-start justify-between">
        <CargoTypeBadge value={cargoType} />
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Merchandise actions"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="-m-1 flex h-7 w-7 items-center justify-center rounded-md text-[#94A3B8] transition-colors hover:bg-[#F1F5F9] hover:text-[#64748B] data-[state=open]:bg-[#F1F5F9] data-[state=open]:text-[#64748B]"
          >
            <MoreVertical size={16} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem asChild>
              <Link href={`/merchandises/${id}`} className="cursor-pointer">
                <Eye size={15} className="text-[#475569]" />
                <span>View</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                onEdit(merchandise);
              }}
            >
              <Pencil size={15} className="text-[#475569]" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault();
                onDelete(merchandise);
              }}
              className="text-[#DC2626] focus:bg-[#FEF2F2] focus:text-[#DC2626]"
            >
              <Trash2 size={15} />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h3 className="mt-4 line-clamp-2 text-[18px] font-semibold leading-snug text-[#0F172A]">
        {description}
      </h3>

      <dl className="mt-3 flex gap-6">
        <div>
          <dt className="text-[10px] font-medium uppercase tracking-wider text-[#94A3B8]">
            Weight
          </dt>
          <dd className="mt-0.5 text-[14px] font-semibold text-[#0F172A]">
            {weight !== null ? `${weight} t` : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-medium uppercase tracking-wider text-[#94A3B8]">
            Heat №
          </dt>
          <dd className="mt-0.5 text-[14px] font-semibold text-[#0F172A]">
            {numberOfHeat !== null ? numberOfHeat : "—"}
          </dd>
        </div>
      </dl>

      {note ? (
        <p className="mt-3 line-clamp-1 text-[13px] text-[#64748B]">{note}</p>
      ) : null}
    </Link>
  );
}
