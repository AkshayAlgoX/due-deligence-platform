"use client";

import Link from "next/link";
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
  LogOut,
} from "lucide-react";

const menuItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Property Search", href: "/property-search", icon: Search, active: true },
  { title: "Due Diligence", href: "/due-deligence", icon: ShieldCheck },
  { title: "Risk Assessment", href: "/risk-assessment", icon: AlertTriangle },
  { title: "Property Comparison", href: "/property-comparison", icon: GitCompare },
  { title: "Reports", href: "/reports", icon: FileText },
  { title: "Notifications", href: "/notifications", icon: Bell },
  { title: "Audit Logs", href: "/audit-logs", icon: ClipboardList },
  { title: "Profile", href: "/profile", icon: User },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r min-h-[calc(100vh-80px)] flex flex-col">

      <nav className="flex-1 px-4 py-6">

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.title}
              href={item.href}
              className={`mb-2 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                item.active
                  ? "bg-green-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon size={18} />
              {item.title}
            </Link>
          );
        })}

      </nav>

      <div className="border-t px-6 py-5">

        <button className="flex items-center gap-2 text-red-500 text-sm font-medium">
          <LogOut size={18} />
          Logout
        </button>

      </div>

    </aside>
  );
}