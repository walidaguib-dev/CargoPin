import type { CargoType } from "@/lib/merchandises/types";

type BadgeColors = {
  bg: string;
  text: string;
  className: string;
};

const FALLBACK: BadgeColors = {
  bg: "#F1F5F9",
  text: "#475569",
  className: "bg-[#F1F5F9] text-[#475569]",
};

const COLORS: Record<CargoType, BadgeColors> = {
  Bulk: {
    bg: "#DBEAFE",
    text: "#1D4ED8",
    className: "bg-[#DBEAFE] text-[#1D4ED8]",
  },
  General: {
    bg: "#DCFCE7",
    text: "#166534",
    className: "bg-[#DCFCE7] text-[#166534]",
  },
  Container: {
    bg: "#FEF3C7",
    text: "#92400E",
    className: "bg-[#FEF3C7] text-[#92400E]",
  },
  Vehicle: {
    bg: "#FCE7F3",
    text: "#9F1239",
    className: "bg-[#FCE7F3] text-[#9F1239]",
  },
};

function isCargoType(value: string): value is CargoType {
  return value in COLORS;
}

export function cargoTypeColors(value: string): BadgeColors {
  return isCargoType(value) ? COLORS[value] : FALLBACK;
}

interface CargoTypeBadgeProps {
  value: string;
}

export function CargoTypeBadge({ value }: CargoTypeBadgeProps) {
  const colors = cargoTypeColors(value);
  return (
    <span
      className={`inline-flex items-center rounded px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${colors.className}`}
    >
      {value}
    </span>
  );
}
