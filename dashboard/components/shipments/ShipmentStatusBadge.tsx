import { SHIPMENT_STATUS_LABELS, type ShipmentStatus } from "@/lib/shipments/types";

type BadgeColors = {
  className: string;
};

const FALLBACK: BadgeColors = { className: "bg-[#F1F5F9] text-[#475569]" };

const COLORS: Record<ShipmentStatus, BadgeColors> = {
  Awaiting: { className: "bg-[#FEF3C7] text-[#92400E]" },
  Stored: { className: "bg-[#DCFCE7] text-[#166534]" },
  PartiallyStored: { className: "bg-[#DBEAFE] text-[#1D4ED8]" },
  Released: { className: "bg-[#F1F5F9] text-[#475569]" },
};

function isShipmentStatus(value: string): value is ShipmentStatus {
  return value in COLORS;
}

interface ShipmentStatusBadgeProps {
  value: string;
}

export function ShipmentStatusBadge({ value }: ShipmentStatusBadgeProps) {
  const colors = isShipmentStatus(value) ? COLORS[value] : FALLBACK;
  const label = isShipmentStatus(value) ? SHIPMENT_STATUS_LABELS[value] : value;
  return (
    <span
      className={`inline-flex items-center rounded px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${colors.className}`}
    >
      {label}
    </span>
  );
}
