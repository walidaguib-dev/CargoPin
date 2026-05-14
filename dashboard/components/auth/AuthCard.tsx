import type { ReactNode } from "react";

interface AuthCardProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthCard({ children, title, subtitle }: AuthCardProps) {
  return (
    <div
      className="w-full sm:w-[420px] bg-white rounded-2xl p-10"
      style={{ boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}
    >
      <div className="flex flex-col items-center mb-8">
        <span className="font-bold text-[22px] text-[#0EA5E9] leading-none">
          CargoPin
        </span>
        <span className="mt-2 text-[10px] tracking-[0.2em] text-[#64748B] uppercase">
          Port Operations System
        </span>
      </div>

      <h1 className="text-[22px] font-semibold text-[#0F172A] leading-tight">
        {title}
      </h1>
      <p className="text-[14px] text-[#64748B] mt-1 mb-6">{subtitle}</p>

      {children}
    </div>
  );
}
