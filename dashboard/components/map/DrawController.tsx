"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-draw";

export interface DrawControllerHandle {
  startPolygon: () => void;
  startRectangle: () => void;
  removePendingLayer: () => void;
}

interface DrawControllerProps {
  onCreated: (coordinates: [number, number][]) => void;
}

// Deliberately doesn't render leaflet-draw's own <EditControl> toolbar widget —
// the task's flow is driven entirely by the custom "Draw Zone"/"Draw Area" buttons
// in the outer Tailwind toolbar, so this just uses the leaflet-draw *engine*
// (L.Draw.Polygon/Rectangle, draw:created event) imperatively, triggered via the
// exposed ref handle, with no visible in-map control of its own.
export const DrawController = forwardRef<DrawControllerHandle, DrawControllerProps>(
  function DrawController({ onCreated }, ref) {
    const map = useMap();
    const pendingLayerRef = useRef<L.Layer | null>(null);
    const onCreatedRef = useRef(onCreated);
    onCreatedRef.current = onCreated;

    useEffect(() => {
      function handleCreated(e: L.LeafletEvent) {
        const event = e as L.DrawEvents.Created;
        const layer = event.layer as L.Polygon;

        const rings = layer.getLatLngs() as unknown as L.LatLng[][];
        const outerRing = rings[0] ?? [];
        let coordinates: [number, number][] = outerRing.map((p) => [p.lat, p.lng]);

        // Ensure the polygon is closed (first point === last point).
        if (
          coordinates.length > 0 &&
          (coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
            coordinates[0][1] !== coordinates[coordinates.length - 1][1])
        ) {
          coordinates = [...coordinates, coordinates[0]];
        }

        layer.addTo(map);
        pendingLayerRef.current = layer;
        onCreatedRef.current(coordinates);
      }

      map.on(L.Draw.Event.CREATED, handleCreated);
      return () => {
        map.off(L.Draw.Event.CREATED, handleCreated);
      };
    }, [map]);

    useImperativeHandle(
      ref,
      () => ({
        startPolygon: () => {
          new L.Draw.Polygon(map as unknown as L.DrawMap, {
            shapeOptions: { color: "#0EA5E9", weight: 2 },
          }).enable();
        },
        startRectangle: () => {
          new L.Draw.Rectangle(map as unknown as L.DrawMap, {
            shapeOptions: { color: "#0EA5E9", weight: 2 },
          }).enable();
        },
        removePendingLayer: () => {
          if (pendingLayerRef.current) {
            map.removeLayer(pendingLayerRef.current);
            pendingLayerRef.current = null;
          }
        },
      }),
      [map],
    );

    return null;
  },
);
