"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Leaflet touches `window`/`document` at import time, so MapView must never be
// pulled into a server render. ssr:false plus this being the ONLY place that
// imports it keeps "leaflet" entirely out of the page's server bundle.
const MapView = dynamic(() => import("@/components/map/MapView").then((m) => m.MapView), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-[#94A3B8]" />
    </div>
  ),
});

export default function MapPage() {
  return (
    // Stays inside <main>'s normal content box (same p-8 gutter every other
    // dashboard page gets) instead of fighting it with negative margins — that
    // earlier approach widened/shifted this box 2rem past main's real edges on
    // every side, which is what spilled it under the sidebar on the left and
    // clipped the toolbar/legend off-screen on the right.
    <div className="h-full w-full">
      <MapView />
    </div>
  );
}
