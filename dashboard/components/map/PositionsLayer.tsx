"use client";

import { CircleMarker, Popup } from "react-leaflet";

import type { GeoJsonFeatureCollection, PositionGeoJsonProperties } from "@/lib/map/geojson-types";
import { pointToLatLng } from "./geo";

interface PositionsLayerProps {
  data: GeoJsonFeatureCollection<PositionGeoJsonProperties> | null;
}

// Has Area -> blue, Zone only -> yellow, Emergency -> red. These three are mutually
// exclusive by construction (CreateMerchandiseAreaPositionHandler only ever sets
// IsEmergencyPlacement when both area and zone are null), so a simple priority
// check is enough — no case where two of these could apply to the same position.
function colorFor(props: PositionGeoJsonProperties): string {
  if (props.isEmergencyPlacement) return "#DC2626";
  if (props.areaName) return "#2563EB";
  if (props.zoneName) return "#EAB308";
  return "#64748B";
}

function formatPlacedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PositionsLayer({ data }: PositionsLayerProps) {
  if (!data) return null;

  return (
    <>
      {data.features.map((feature) => {
        const color = colorFor(feature.properties);
        return (
          <CircleMarker
            key={feature.properties.id}
            center={pointToLatLng(feature)}
            radius={8}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.85, weight: 1 }}
          >
            <Popup>
              <div className="min-w-48 text-[13px]">
                {feature.properties.isEmergencyPlacement ? (
                  <span className="mb-1 inline-flex items-center rounded bg-[#FEE2E2] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#DC2626]">
                    Emergency
                  </span>
                ) : null}
                <p className="font-semibold text-[#0F172A]">{feature.properties.clientName}</p>
                <p className="mt-1 text-[#64748B]">
                  Merchandise: {feature.properties.merchandiseDescription}
                </p>
                <p className="text-[#64748B]">Vessel: {feature.properties.vesselName}</p>
                {feature.properties.areaName ? (
                  <p className="text-[#64748B]">Area: {feature.properties.areaName}</p>
                ) : null}
                {feature.properties.zoneName ? (
                  <p className="text-[#64748B]">Zone: {feature.properties.zoneName}</p>
                ) : null}
                <p className="mt-1 text-[#94A3B8]">
                  Placed at: {formatPlacedAt(feature.properties.placedAt)}
                </p>
                {feature.properties.notes ? (
                  <p className="mt-1 text-[#64748B]">Notes: {feature.properties.notes}</p>
                ) : null}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}
