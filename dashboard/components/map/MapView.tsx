"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { toast } from "sonner";

import { withRetry } from "@/lib/utils";
import { useSignalR } from "@/context/SignalRContext";
import {
  fetchAreasGeoJson,
  fetchPositionsGeoJson,
  fetchZonesGeoJson,
} from "@/lib/map/api";
import type {
  AreaGeoJsonProperties,
  GeoJsonFeatureCollection,
  PositionGeoJsonProperties,
  ZoneGeoJsonProperties,
} from "@/lib/map/geojson-types";
import type { PositionCreatedPayload } from "@/lib/map/signalr";

import { ZonesLayer } from "./ZonesLayer";
import { AreasLayer } from "./AreasLayer";
import { PositionsLayer } from "./PositionsLayer";
import { DrawController, type DrawControllerHandle } from "./DrawController";
import { MapToolbar, type DrawShape } from "./MapToolbar";
import { CreateZoneModal } from "./CreateZoneModal";
import { CreateAreaModal } from "./CreateAreaModal";
import { EditZoneModal } from "./EditZoneModal";
import { EditAreaModal } from "./EditAreaModal";
import { DeleteZonePopup, type DeleteZoneTarget } from "./DeleteZonePopup";
import { DeleteAreaPopup, type DeleteAreaTarget } from "./DeleteAreaPopup";

// Leaflet's default marker icon resolves its image URLs relative to the bundler
// output, which breaks under webpack/Next.js. Re-pointing at the static copies in
// public/leaflet/ (copied from node_modules/leaflet/dist/images) is the standard
// fix. This runs once when this client-only module is first loaded — safe here
// specifically because the page imports this component with next/dynamic
// { ssr: false }, so it never executes during a server render.
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

const PORT_CENTER: [number, number] = [37.7327, 6.5722];
const PORT_ZOOM = 15;

type PendingDraw = { kind: "zone" | "area"; coordinates: [number, number][] } | null;

export function MapView() {
  const [zones, setZones] = useState<GeoJsonFeatureCollection<ZoneGeoJsonProperties> | null>(null);
  const [areas, setAreas] = useState<GeoJsonFeatureCollection<AreaGeoJsonProperties> | null>(null);
  const [positions, setPositions] = useState<GeoJsonFeatureCollection<PositionGeoJsonProperties> | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [shape, setShape] = useState<DrawShape>("polygon");
  const [pendingDraw, setPendingDraw] = useState<PendingDraw>(null);
  const drawControllerRef = useRef<DrawControllerHandle>(null);
  const activeKindRef = useRef<"zone" | "area">("zone");

  const [editingZoneId, setEditingZoneId] = useState<number | null>(null);
  const [editingAreaId, setEditingAreaId] = useState<number | null>(null);
  const [deletingZone, setDeletingZone] = useState<DeleteZoneTarget | null>(null);
  const [deletingArea, setDeletingArea] = useState<DeleteAreaTarget | null>(null);

  const loadAll = useCallback(() => {
    setIsLoading(true);
    setLoadError(false);
    withRetry(() =>
      Promise.all([fetchZonesGeoJson(), fetchAreasGeoJson(), fetchPositionsGeoJson()]),
    )
      .then(([zonesData, areasData, positionsData]) => {
        setZones(zonesData);
        setAreas(areasData);
        setPositions(positionsData);
      })
      .catch(() => setLoadError(true))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const refetchZones = useCallback(() => {
    fetchZonesGeoJson()
      .then(setZones)
      .catch(() => toast.error("Failed to refresh zones"));
  }, []);

  const refetchAreas = useCallback(() => {
    fetchAreasGeoJson()
      .then(setAreas)
      .catch(() => toast.error("Failed to refresh areas"));
  }, []);

  const { onPositionCreated, onPositionReleased } = useSignalR();

  // Live position updates: append on PositionCreated, drop on PositionReleased —
  // no refetch of the whole collection, per the task.
  useEffect(() => {
    // A busy tallyman crew can fire several PositionCreated events within a
    // second or two — one toast per event would stack into a noisy queue.
    // Collapse any burst within an 800ms window into a single toast (using a
    // fixed id so sonner replaces it in place rather than stacking).
    let pendingBurst: { count: number; clientName: string; merchandiseDescription: string } | null =
      null;
    let burstTimer: ReturnType<typeof setTimeout> | null = null;

    function flushBurst() {
      if (!pendingBurst) return;
      const { count, clientName, merchandiseDescription } = pendingBurst;
      pendingBurst = null;
      toast.info(
        count === 1
          ? `New position: ${clientName} — ${merchandiseDescription}`
          : `${count} new positions added`,
        { id: "position-created", duration: 4000 },
      );
    }

    const unsubscribeCreated = onPositionCreated((payload: PositionCreatedPayload) => {
      setPositions((prev) => {
        const base = prev ?? { type: "FeatureCollection" as const, features: [] };
        if (base.features.some((f) => f.properties.id === payload.positionId)) return base;
        return {
          ...base,
          features: [
            ...base.features,
            {
              type: "Feature" as const,
              geometry: {
                type: "Point" as const,
                coordinates: [payload.longitude, payload.latitude] as [number, number],
              },
              properties: {
                id: payload.positionId,
                clientName: payload.clientName,
                merchandiseDescription: payload.merchandiseDescription,
                vesselName: payload.vesselName,
                areaName: payload.areaName,
                zoneName: payload.zoneName,
                isEmergencyPlacement: payload.isEmergencyPlacement,
                placedAt: payload.placedAt,
                notes: null,
              },
            },
          ],
        };
      });

      pendingBurst = pendingBurst
        ? { ...pendingBurst, count: pendingBurst.count + 1, clientName: payload.clientName, merchandiseDescription: payload.merchandiseDescription }
        : { count: 1, clientName: payload.clientName, merchandiseDescription: payload.merchandiseDescription };

      if (burstTimer) clearTimeout(burstTimer);
      burstTimer = setTimeout(flushBurst, 800);
    });

    const unsubscribeReleased = onPositionReleased((payload) => {
      setPositions((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          features: prev.features.filter((f) => f.properties.id !== payload.positionId),
        };
      });
    });

    return () => {
      if (burstTimer) clearTimeout(burstTimer);
      unsubscribeCreated();
      unsubscribeReleased();
    };
  }, [onPositionCreated, onPositionReleased]);

  const startDraw = (kind: "zone" | "area") => {
    activeKindRef.current = kind;
    if (shape === "polygon") drawControllerRef.current?.startPolygon();
    else drawControllerRef.current?.startRectangle();
  };

  const handleDrawCreated = useCallback((coordinates: [number, number][]) => {
    setPendingDraw({ kind: activeKindRef.current, coordinates });
  }, []);

  const cancelPendingDraw = () => {
    drawControllerRef.current?.removePendingLayer();
    setPendingDraw(null);
  };

  return (
    <div className="flex h-full w-full flex-col">
      <MapToolbar
        shape={shape}
        onShapeChange={setShape}
        onDrawZone={() => startDraw("zone")}
        onDrawArea={() => startDraw("area")}
        disabled={pendingDraw !== null}
      />

      <div className="relative flex-1">
        {isLoading ? (
          <div className="absolute left-1/2 top-4 z-30 -translate-x-1/2 rounded-full bg-white px-4 py-1.5 text-[13px] font-medium text-[#475569] shadow-md">
            Loading map data...
          </div>
        ) : null}
        {loadError ? (
          <div className="absolute left-1/2 top-4 z-30 -translate-x-1/2 rounded-full bg-[#FEE2E2] px-4 py-1.5 text-[13px] font-medium text-[#DC2626] shadow-md">
            Failed to load some map data. Showing what&apos;s available.
          </div>
        ) : null}

        <MapContainer center={PORT_CENTER} zoom={PORT_ZOOM} className="h-full w-full">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <DrawController ref={drawControllerRef} onCreated={handleDrawCreated} />

          <ZonesLayer data={zones} onEdit={setEditingZoneId} onDelete={(id, name) => setDeletingZone({ id, name })} />
          <AreasLayer data={areas} onEdit={setEditingAreaId} onDelete={(id, name) => setDeletingArea({ id, name })} />
          <PositionsLayer
            data={positions}
            onDeleted={(id) =>
              setPositions((prev) =>
                prev
                  ? { ...prev, features: prev.features.filter((f) => f.properties.id !== id) }
                  : null,
              )
            }
          />
        </MapContainer>
      </div>

      <CreateZoneModal
        open={pendingDraw?.kind === "zone"}
        coordinates={pendingDraw?.kind === "zone" ? pendingDraw.coordinates : null}
        onOpenChange={(open) => {
          if (!open) cancelPendingDraw();
        }}
        onCreated={() => {
          cancelPendingDraw();
          refetchZones();
        }}
      />
      <CreateAreaModal
        open={pendingDraw?.kind === "area"}
        coordinates={pendingDraw?.kind === "area" ? pendingDraw.coordinates : null}
        onOpenChange={(open) => {
          if (!open) cancelPendingDraw();
        }}
        onCreated={() => {
          cancelPendingDraw();
          refetchAreas();
        }}
      />

      <EditZoneModal
        zoneId={editingZoneId}
        onOpenChange={(open) => !open && setEditingZoneId(null)}
        onUpdated={() => {
          setEditingZoneId(null);
          refetchZones();
        }}
      />
      <EditAreaModal
        areaId={editingAreaId}
        onOpenChange={(open) => !open && setEditingAreaId(null)}
        onUpdated={() => {
          setEditingAreaId(null);
          refetchAreas();
        }}
      />

      <DeleteZonePopup
        target={deletingZone}
        onOpenChange={(open) => !open && setDeletingZone(null)}
        onDeleted={() => {
          setDeletingZone(null);
          refetchZones();
        }}
      />
      <DeleteAreaPopup
        target={deletingArea}
        onOpenChange={(open) => !open && setDeletingArea(null)}
        onDeleted={() => {
          setDeletingArea(null);
          refetchAreas();
        }}
      />
    </div>
  );
}
