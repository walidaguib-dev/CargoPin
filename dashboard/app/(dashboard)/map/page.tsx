"use client";

import { useAuth } from "@/context/AuthContext";

export default function MapPage() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold text-[#0F172A]">Map</h1>
      <p className="text-sm text-[#64748B]">Dashboard coming soon.</p>
      <button
        onClick={logout}
        className="text-sm text-[#0EA5E9] hover:underline"
      >
        Sign out
      </button>
    </div>
  );
}
