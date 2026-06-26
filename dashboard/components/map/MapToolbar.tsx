"use client";

import { Hexagon, Square } from "lucide-react";

import { Button } from "@/components/ui/button";

export type DrawShape = "polygon" | "rectangle";

interface MapToolbarProps {
  shape: DrawShape;
  onShapeChange: (shape: DrawShape) => void;
  onDrawZone: () => void;
  onDrawArea: () => void;
  disabled: boolean;
}

interface LegendItemProps {
  swatchClassName: string;
  label: string;
}

function LegendSwatch({ swatchClassName, label }: LegendItemProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-block h-3 w-3 shrink-0 rounded-sm ${swatchClassName}`} />
      <span className="text-[12px] text-[#475569]">{label}</span>
    </div>
  );
}

// Sticky toolbar above the map. Left: Draw Zone/Draw Area buttons + a polygon/
// rectangle shape toggle ("Enable only polygon and rectangle drawing tools" — no
// stock leaflet-draw toolbar widget is shown in the map itself; see DrawController).
// Right: legend, per the task's exact swatch list.
export function MapToolbar({ shape, onShapeChange, onDrawZone, onDrawArea, disabled }: MapToolbarProps) {
  return (
    <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 border-b border-[#E2E8F0] bg-white px-5 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center rounded-lg border border-[#E2E8F0] p-0.5">
          <button
            type="button"
            onClick={() => onShapeChange("polygon")}
            aria-pressed={shape === "polygon"}
            title="Polygon"
            className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
              shape === "polygon" ? "bg-[#E0F2FE] text-[#0EA5E9]" : "text-[#94A3B8] hover:bg-[#F1F5F9]"
            }`}
          >
            <Hexagon size={16} />
          </button>
          <button
            type="button"
            onClick={() => onShapeChange("rectangle")}
            aria-pressed={shape === "rectangle"}
            title="Rectangle"
            className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
              shape === "rectangle" ? "bg-[#E0F2FE] text-[#0EA5E9]" : "text-[#94A3B8] hover:bg-[#F1F5F9]"
            }`}
          >
            <Square size={16} />
          </button>
        </div>

        <Button
          type="button"
          onClick={onDrawZone}
          disabled={disabled}
          className="h-9 gap-1.5 rounded-lg bg-[#0EA5E9] px-3.5 text-[13px] font-semibold text-white hover:bg-[#0284C7]"
        >
          Draw Zone
        </Button>
        <Button
          type="button"
          onClick={onDrawArea}
          disabled={disabled}
          className="h-9 gap-1.5 rounded-lg bg-[#16A34A] px-3.5 text-[13px] font-semibold text-white hover:bg-[#15803D]"
        >
          Draw Area
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <LegendSwatch swatchClassName="border-2 border-[#2563EB] bg-[#60A5FA]/15" label="Zone" />
        <LegendSwatch swatchClassName="bg-[#4ADE80]" label="Available Area" />
        <LegendSwatch swatchClassName="bg-[#FB923C]" label="Occupied Area" />
        <LegendSwatch swatchClassName="bg-[#F87171]" label="Blocked Area" />
        <LegendSwatch swatchClassName="rounded-full bg-[#2563EB]" label="Position in Area" />
        <LegendSwatch swatchClassName="rounded-full bg-[#EAB308]" label="Position in Zone only" />
        <LegendSwatch swatchClassName="rounded-full bg-[#DC2626]" label="Emergency Position" />
      </div>
    </div>
  );
}
