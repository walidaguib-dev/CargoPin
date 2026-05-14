import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4 py-10"
      style={{
        backgroundColor: "#0A1628",
        backgroundImage: "radial-gradient(#1E3A5F 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      {children}
    </div>
  );
}
