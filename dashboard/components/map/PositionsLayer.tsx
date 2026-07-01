"use client";

import { useState } from "react";
import { CircleMarker, Popup } from "react-leaflet";
import { toast } from "sonner";

import type { GeoJsonFeatureCollection, PositionGeoJsonProperties } from "@/lib/map/geojson-types";
import { useAuth } from "@/context/AuthContext";
import { deletePosition } from "@/lib/map/api";
import { pointToLatLng } from "./geo";

interface PositionsLayerProps {
  data: GeoJsonFeatureCollection<PositionGeoJsonProperties> | null;
  onDeleted: (id: number) => void;
}

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

export function PositionsLayer({ data, onDeleted }: PositionsLayerProps) {
  const { accessToken } = useAuth();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function handleDelete(id: number) {
    if (!confirm("Delete this position? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await deletePosition(id, accessToken);
      onDeleted(id);
      toast.success("Position deleted successfully");
    } catch {
      toast.error("Failed to delete position");
    } finally {
      setDeletingId(null);
    }
  }

  if (!data) return null;

  return (
    <>
      {data.features.map((feature) => {
        const color = colorFor(feature.properties);
        const coords =
          feature.geometry.type === "Point"
            ? feature.geometry.coordinates
            : ([0, 0] as [number, number]);
        const lat = coords[1];
        const lng = coords[0];
        const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
        const isDeleting = deletingId === feature.properties.id;

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

                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "block",
                    marginTop: "8px",
                    color: "#0EA5E9",
                    fontSize: "12px",
                    textDecoration: "none",
                    fontWeight: "600",
                  }}
                >
                  📍 Open in Google Maps
                </a>

                <button
                  type="button"
                  onClick={() => void handleDelete(feature.properties.id)}
                  disabled={isDeleting}
                  style={{
                    display: "block",
                    width: "100%",
                    marginTop: "8px",
                    padding: "6px 12px",
                    backgroundColor: isDeleting ? "#FCA5A5" : "#EF4444",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: isDeleting ? "not-allowed" : "pointer",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  {isDeleting ? "Deleting…" : "Delete Position"}
                </button>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}
