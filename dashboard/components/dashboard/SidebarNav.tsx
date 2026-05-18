"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_SECTIONS } from "./nav-config";

interface SidebarNavProps {
  onNavigate?: () => void;
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4">
      {NAV_SECTIONS.map((section, index) => (
        <div key={section.id} className={index === 0 ? "" : "mt-[18px]"}>
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">
            {section.label}
          </div>
          <ul className="flex flex-col gap-0.5">
            {section.items.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={isActive ? "page" : undefined}
                    className={[
                      "flex h-10 items-center gap-3 rounded-md px-3 text-[14px] transition-colors",
                      isActive
                        ? "bg-[#E0F2FE] font-semibold text-[#0EA5E9]"
                        : "font-medium text-[#475569] hover:bg-[#F1F5F9] hover:text-[#0F172A]",
                    ].join(" ")}
                  >
                    <Icon
                      size={16}
                      strokeWidth={isActive ? 2 : 1.7}
                      color={isActive ? "#0EA5E9" : "#64748B"}
                    />
                    <span>{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
