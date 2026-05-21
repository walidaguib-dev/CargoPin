"use client";

import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Merchandise } from "@/lib/merchandises/types";

import { CargoTypeBadge } from "./CargoTypeBadge";

interface MerchandiseDetailCardProps {
  merchandise: Merchandise;
  onEdit: () => void;
  onDelete: () => void;
}

interface PropertyProps {
  label: string;
  value: string | number | null;
  muted?: boolean;
}

function Property({ label, value, muted = false }: PropertyProps) {
  const isNull = value === null || value === "";
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
        {label}
      </div>
      <div
        className={[
          "mt-1 text-[16px]",
          isNull
            ? "text-[#CBD5E1]"
            : muted
              ? "font-normal text-[#64748B]"
              : "font-medium text-[#0F172A]",
        ].join(" ")}
      >
        {isNull ? "—" : value}
      </div>
    </div>
  );
}

export function MerchandiseDetailCard({
  merchandise,
  onEdit,
  onDelete,
}: MerchandiseDetailCardProps) {
  const { id, description, cargoType, weight, numberOfHeat, note } =
    merchandise;

  return (
    <article className="mx-auto max-w-180 rounded-2xl border border-[#E2E8F0] bg-white p-8 shadow-sm">
      <header className="flex items-start justify-between gap-4">
        <CargoTypeBadge value={cargoType} />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onEdit}
            className="h-9 gap-1.5 rounded-lg border-[#E2E8F0] bg-white px-3 text-[14px] font-medium text-[#374151] hover:bg-[#F9FAFB]"
          >
            <Pencil size={15} />
            Edit
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onDelete}
            className="h-9 gap-1.5 rounded-lg border-[#FCA5A5] bg-white px-3 text-[14px] font-medium text-[#DC2626] hover:bg-[#FEF2F2] hover:text-[#DC2626]"
          >
            <Trash2 size={15} />
            Delete
          </Button>
        </div>
      </header>

      <h1 className="mt-5 text-[28px] font-bold leading-tight text-[#0F172A]">
        {description}
      </h1>

      <div className="mt-8 grid grid-cols-2 gap-x-12 gap-y-6">
        <Property label="Cargo Type" value={cargoType} />
        <Property
          label="Weight"
          value={weight !== null ? `${weight} tons` : null}
        />
        <Property label="Heat Number" value={numberOfHeat} />
        <Property label="ID" value={`#${id}`} muted />
      </div>

      <div className="mt-8">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
          Note
        </div>
        {note ? (
          <p className="mt-2 text-[14px] leading-relaxed text-[#374151]">
            {note}
          </p>
        ) : (
          <p className="mt-2 text-[14px] italic text-[#94A3B8]">No notes</p>
        )}
      </div>
    </article>
  );
}
