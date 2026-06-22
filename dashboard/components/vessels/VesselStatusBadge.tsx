import { VESSEL_STATUS_LABELS, type VesselStatus } from "@/lib/vessels/types";

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

const COLORS: Record<VesselStatus, BadgeColors> = {
  Expected: {
    bg: "#FEF3C7",
    text: "#92400E",
    className: "bg-[#FEF3C7] text-[#92400E]",
  },
  Berthed: {
    bg: "#DCFCE7",
    text: "#166534",
    className: "bg-[#DCFCE7] text-[#166534]",
  },
  Departed: {
    bg: "#F1F5F9",
    text: "#475569",
    className: "bg-[#F1F5F9] text-[#475569]",
  },
};

function isVesselStatus(value: string): value is VesselStatus {
  return value in COLORS;
}

export function vesselStatusColors(value: string): BadgeColors {
  return isVesselStatus(value) ? COLORS[value] : FALLBACK;
}

interface VesselStatusBadgeProps {
  value: string;
}

export function VesselStatusBadge({ value }: VesselStatusBadgeProps) {
  const colors = vesselStatusColors(value);
  const label = isVesselStatus(value) ? VESSEL_STATUS_LABELS[value] : value;
  return (
    <span
      className={`inline-flex items-center rounded px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${colors.className}`}
    >
      {label}
    </span>
  );
}
