"use client";

import { Polygon, Popup } from "react-leaflet";

import type { AreaGeoJsonProperties, GeoJsonFeatureCollection } from "@/lib/map/geojson-types";
import { polygonToLatLngs } from "./geo";

interface AreasLayerProps {
  data: GeoJsonFeatureCollection<AreaGeoJsonProperties> | null;
  onEdit: (id: number) => void;
  onDelete: (id: number, name: string) => void;
}

// Available -> green, Occupied -> orange, Blocked -> red. Fill opacity 0.3, 2px
// border — per the task. Matches AreaStatus string values exactly as the REST
// GeoJSON endpoint emits them (plain C# enum .ToString(), PascalCase).
const AREA_COLORS: Record<string, { color: string; fillColor: string }> = {
  Available: { color: "#16A34A", fillColor: "#4ADE80" },
  Occupied: { color: "#EA580C", fillColor: "#FB923C" },
  Blocked: { color: "#DC2626", fillColor: "#F87171" },
};
const FALLBACK_COLOR = { color: "#64748B", fillColor: "#94A3B8" };

export function AreasLayer({ data, onEdit, onDelete }: AreasLayerProps) {
  if (!data) return null;

  return (
    <>
      {data.features.map((feature) => {
        const colors = AREA_COLORS[feature.properties.status] ?? FALLBACK_COLOR;
        return (
          <Polygon
            key={feature.properties.id}
            positions={polygonToLatLngs(feature)}
            pathOptions={{ ...colors, weight: 2, fillOpacity: 0.3 }}
          >
            <Popup>
              <div className="min-w-44 text-[13px]">
                <p className="font-semibold text-[#0F172A]">{feature.properties.name}</p>
                <p className="mt-1 text-[#64748B]">Code: {feature.properties.code}</p>
                <p className="text-[#64748B]">Status: {feature.properties.status}</p>
                <p className="text-[#64748B]">Zone: {feature.properties.zoneName}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEdit(feature.properties.id)}
                    className="rounded bg-[#0EA5E9] px-2 py-1 text-[12px] font-medium text-white hover:bg-[#0284C7]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(feature.properties.id, feature.properties.name)}
                    className="rounded bg-[#EF4444] px-2 py-1 text-[12px] font-medium text-white hover:bg-[#DC2626]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </Popup>
          </Polygon>
        );
      })}
    </>
  );
}
