"use client";

import { Polygon, Popup } from "react-leaflet";

import type { GeoJsonFeatureCollection, ZoneGeoJsonProperties } from "@/lib/map/geojson-types";
import { polygonToLatLngs } from "./geo";

interface ZonesLayerProps {
  data: GeoJsonFeatureCollection<ZoneGeoJsonProperties> | null;
  onEdit: (id: number) => void;
  onDelete: (id: number, name: string) => void;
}

// Blue outline, light blue fill (opacity 0.15), 2px border — per the task.
const ZONE_STYLE = { color: "#2563EB", weight: 2, fillColor: "#60A5FA", fillOpacity: 0.15 };

export function ZonesLayer({ data, onEdit, onDelete }: ZonesLayerProps) {
  if (!data) return null;

  return (
    <>
      {data.features.map((feature) => (
        <Polygon
          key={feature.properties.id}
          positions={polygonToLatLngs(feature)}
          pathOptions={ZONE_STYLE}
        >
          <Popup>
            <div className="min-w-44 text-[13px]">
              <p className="font-semibold text-[#0F172A]">{feature.properties.name}</p>
              <p className="mt-1 text-[#64748B]">Code: {feature.properties.code}</p>
              <p className="text-[#64748B]">Type: {feature.properties.type}</p>
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
      ))}
    </>
  );
}
