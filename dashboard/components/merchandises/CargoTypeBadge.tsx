import { CARGO_TYPE_LABELS, type CargoType } from "@/lib/merchandises/types";

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
  GeneralCargo: {
    bg: "#DCFCE7",
    text: "#166534",
    className: "bg-[#DCFCE7] text-[#166534]",
  },
  SteelCoils: {
    bg: "#DBEAFE",
    text: "#1D4ED8",
    className: "bg-[#DBEAFE] text-[#1D4ED8]",
  },
  Colis: {
    bg: "#FEF3C7",
    text: "#92400E",
    className: "bg-[#FEF3C7] text-[#92400E]",
  },
  Bulk: {
    bg: "#E0E7FF",
    text: "#4338CA",
    className: "bg-[#E0E7FF] text-[#4338CA]",
  },
  Machinery: {
    bg: "#FCE7F3",
    text: "#9F1239",
    className: "bg-[#FCE7F3] text-[#9F1239]",
  },
  Dangerous: {
    bg: "#FEE2E2",
    text: "#B91C1C",
    className: "bg-[#FEE2E2] text-[#B91C1C]",
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
  const label = isCargoType(value) ? CARGO_TYPE_LABELS[value] : value;
  return (
    <span
      className={`inline-flex items-center rounded px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${colors.className}`}
    >
      {label}
    </span>
  );
}
