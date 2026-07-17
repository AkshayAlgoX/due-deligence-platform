"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  ShieldCheck,
  AlertTriangle,
  GitCompare,
  FileText,
  Bell,
  ClipboardList,
  User,
} from "lucide-react";

const menuItems = [
  { title: "Dashboard",           href: "/dashboard",                     icon: LayoutDashboard },
  { title: "Property Search",     href: "/dashboard/property-search",     icon: Search },
  { title: "Due Diligence",       href: "/dashboard/due-diligence",       icon: ShieldCheck },
  { title: "Risk Assessment",     href: "/dashboard/risk-assessment",     icon: AlertTriangle },
  { title: "Property Comparison", href: "/dashboard/property-comparison", icon: GitCompare },
  { title: "Reports",             href: "/dashboard/reports",             icon: FileText },
  { title: "Notifications",       href: "/dashboard/notifications",       icon: Bell },
  { title: "Audit Logs",          href: "/dashboard/audit-logs",          icon: ClipboardList },
  { title: "Profile",             href: "/dashboard/profile",             icon: User },
];

export default function Sidebar({ isOpen = true }) {
  const pathname = usePathname();

  return (
    <aside
      className={`w-64 bg-white border-r flex flex-col h-full transition-all duration-300 ease-in-out ${
        isOpen ? "ml-0" : "-ml-64"
      }`}
    >
      <nav className="flex-1 px-4 py-6 whitespace-nowrap overflow-hidden">
        {menuItems.map((item) => {
          const Icon = item.icon;
          // Dashboard is exact match; others match by prefix
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname?.startsWith(item.href);

          return (
            <Link
              key={item.title}
              href={item.href}
              className={`mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? "bg-green-50 text-[#22C55E]"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon size={18} />
              {item.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}