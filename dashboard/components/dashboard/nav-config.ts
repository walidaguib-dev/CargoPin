import type { LucideIcon } from "lucide-react";
import {
  Map,
  MapPin,
  Package,
  Building2,
  Square,
  Ship,
  Users,
  Boxes,
  UserCog,
} from "lucide-react";

export interface NavItem {
  id: string;
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

export const NAV_SECTIONS: NavSection[] = [
  {
    id: "operations",
    label: "Operations",
    items: [
      { id: "map",        title: "Map View",  href: "/map",        icon: Map },
      { id: "positions",  title: "Positions", href: "/positions",  icon: MapPin },
      { id: "shipments",  title: "Shipments", href: "/shipments",  icon: Package },
    ],
  },
  {
    id: "port-setup",
    label: "Port Setup",
    items: [
      { id: "zones",        title: "Zones",        href: "/zones",        icon: Building2 },
      { id: "areas",        title: "Areas",        href: "/areas",        icon: Square },
      { id: "vessels",      title: "Vessels",      href: "/vessels",      icon: Ship },
      { id: "clients",      title: "Clients",      href: "/clients",      icon: Users },
      { id: "merchandises", title: "Merchandises", href: "/merchandises", icon: Boxes },
    ],
  },
  {
    id: "admin",
    label: "Admin",
    items: [
      { id: "users", title: "Users", href: "/users", icon: UserCog },
    ],
  },
];

export function findNavItem(pathname: string): NavItem | undefined {
  for (const section of NAV_SECTIONS) {
    for (const item of section.items) {
      if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
        return item;
      }
    }
  }
  return undefined;
}
