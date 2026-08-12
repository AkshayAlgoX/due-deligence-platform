"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Search,
  ShieldCheck,
  AlertTriangle,
  GitCompare,
  FileText,
  Bell,
  ClipboardList,
  History,
  User,
  LifeBuoy,
  Bookmark,
  Settings,
  ChevronDown,
  Users,
  BarChart3,
  Server,
} from "lucide-react";

import { getUser } from "@/utils/helpers";

const ROUTE_ROLES = {
  "/dashboard":                    ["BUYER", "REAL_ESTATE_AGENT", "LEGAL_REVIEWER", "FINANCIAL_INSTITUTION", "ADMIN"],
  "/dashboard/property-search":    ["BUYER", "REAL_ESTATE_AGENT", "LEGAL_REVIEWER", "FINANCIAL_INSTITUTION", "ADMIN"],
  "/dashboard/due-diligence":      ["BUYER", "REAL_ESTATE_AGENT", "LEGAL_REVIEWER", "FINANCIAL_INSTITUTION", "ADMIN"],
  "/dashboard/risk-assessment":    ["BUYER", "REAL_ESTATE_AGENT", "LEGAL_REVIEWER", "FINANCIAL_INSTITUTION", "ADMIN"],
  "/dashboard/property-comparison":["BUYER", "REAL_ESTATE_AGENT", "LEGAL_REVIEWER", "FINANCIAL_INSTITUTION", "ADMIN"],
  "/dashboard/saved-comparisons":  ["BUYER", "REAL_ESTATE_AGENT", "LEGAL_REVIEWER", "FINANCIAL_INSTITUTION", "ADMIN"],
  "/reports":                      ["BUYER", "REAL_ESTATE_AGENT", "LEGAL_REVIEWER", "FINANCIAL_INSTITUTION", "ADMIN"],
  "/dashboard/notifications":      ["BUYER", "REAL_ESTATE_AGENT", "LEGAL_REVIEWER", "FINANCIAL_INSTITUTION", "ADMIN"],
  "/dashboard/audit-logs":         ["ADMIN"],
  "/dashboard/report-history":     ["BUYER", "REAL_ESTATE_AGENT", "LEGAL_REVIEWER", "FINANCIAL_INSTITUTION", "ADMIN"],

  // Admin routes
  "/dashboard/admin":              ["ADMIN"],
  "/dashboard/admin/users":        ["ADMIN"],
  "/dashboard/admin/analytics":    ["ADMIN"],
  "/dashboard/admin/system":       ["ADMIN"],

  "/dashboard/profile":            ["BUYER", "REAL_ESTATE_AGENT", "LEGAL_REVIEWER", "FINANCIAL_INSTITUTION", "ADMIN"],
  "/dashboard/settings":           ["BUYER", "REAL_ESTATE_AGENT", "LEGAL_REVIEWER", "FINANCIAL_INSTITUTION", "ADMIN"],
  "/support":                      ["BUYER", "REAL_ESTATE_AGENT", "LEGAL_REVIEWER", "FINANCIAL_INSTITUTION", "ADMIN"],
};

function canAccess(href, role) {
  if (!role) return true;
  const allowed = ROUTE_ROLES[href];
  if (!allowed) return true;
  return allowed.includes(role);
}

// ==========================================
// SIDEBAR MENU CONFIGS — Role-based (Option B)
// Admin gets platform-management sidebar (Vercel/Shopify pattern)
// Regular users (BUYER/AGENT/LEGAL/FINANCIAL) get transactional sidebar
// ==========================================

const MENU_SECTION_CONFIGS_ADMIN = [
  {
    id: "overview",
    sectionKey: "nav.sections.overview",
    collapsible: true,
    items: [
      { titleKey: "nav.dashboard",       href: "/dashboard",                 icon: LayoutDashboard, badge: null },
      { titleKey: "nav.admin.analytics", href: "/dashboard/admin/analytics", icon: BarChart3,       badge: null },
    ],
  },
  {
    id: "platform",
    sectionKey: "nav.sections.platform",
    collapsible: true,
    items: [
      { titleKey: "nav.admin.users",  href: "/dashboard/admin/users",  icon: Users,         badge: null },
      { titleKey: "nav.admin.system", href: "/dashboard/admin/system", icon: Server,        badge: null },
      { titleKey: "nav.auditLogs",    href: "/dashboard/audit-logs",   icon: ClipboardList, badge: null },
    ],
  },
  {
    id: "activity",
    sectionKey: "nav.sections.activity",
    collapsible: true,
    items: [
      { titleKey: "nav.notifications", href: "/dashboard/notifications", icon: Bell, badge: null },
    ],
  },
  {
    id: "account",
    sectionKey: "nav.sections.account",
    collapsible: true,
    items: [
      { titleKey: "nav.profile",  href: "/dashboard/profile",  icon: User,     badge: null },
      { titleKey: "nav.settings", href: "/dashboard/settings", icon: Settings, badge: null },
    ],
  },
];

const MENU_SECTION_CONFIGS_USER = [
  {
    id: "main",
    sectionKey: "nav.sections.main",
    collapsible: true,
    items: [
      { titleKey: "nav.dashboard",      href: "/dashboard",                 icon: LayoutDashboard, badge: null },
      { titleKey: "nav.propertySearch", href: "/dashboard/property-search", icon: Search,          badge: null },
    ],
  },
  {
    id: "analysis",
    sectionKey: "nav.sections.analysis",
    collapsible: true,
    items: [
      { titleKey: "nav.dueDiligence",       href: "/dashboard/due-diligence",       icon: ShieldCheck,   badge: null },
      { titleKey: "nav.riskAssessment",     href: "/dashboard/risk-assessment",     icon: AlertTriangle, badge: null },
      { titleKey: "nav.propertyComparison", href: "/dashboard/property-comparison", icon: GitCompare,    badge: null },
      { titleKey: "nav.savedComparisons",   href: "/dashboard/saved-comparisons",   icon: Bookmark,      badge: null },
    ],
  },
  {
    id: "activity",
    sectionKey: "nav.sections.activity",
    collapsible: true,
    items: [
      { titleKey: "nav.reports",       href: "/reports",                  icon: FileText, badge: null },
      { titleKey: "nav.notifications", href: "/dashboard/notifications",  icon: Bell,     badge: null },
      { titleKey: "nav.reportHistory", href: "/dashboard/report-history", icon: History,  badge: null },
    ],
  },
  {
    id: "account",
    sectionKey: "nav.sections.account",
    collapsible: true,
    items: [
      { titleKey: "nav.profile",  href: "/dashboard/profile",  icon: User,     badge: null },
      { titleKey: "nav.settings", href: "/dashboard/settings", icon: Settings, badge: null },
      { titleKey: "nav.support",  href: "/support",            icon: LifeBuoy, badge: null },
    ],
  },
];

const STORAGE_KEY = "dd_sidebar_sections";

function timeAgo(date, t) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return t("common.justNow");
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return t("common.minutesAgo", { n: mins });
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return t("common.hoursAgo", { n: hrs });
  return date.toLocaleDateString();
}

export default function Sidebar({ isOpen = true, onClose, isDesktopRail = false }) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [sessionStart] = useState(() => new Date());
  const [, tick] = useState(0);

  // Read role synchronously on first render to avoid buyer-sidebar flash for admins
  const [userRole, setUserRole] = useState(() => {
    if (typeof window === "undefined") return "";  // SSR safety — returns empty string on server
    try {
      const user = getUser();
      return user?.role ?? "";
    } catch {
      return "";
    }
  });

  const [collapsedSections, setCollapsedSections] = useState({});

  // Re-check role once mounted (handles rare edge case where user object updates after initial render)
  useEffect(() => {
    const user = getUser();
    const role = user?.role ?? "";
    setUserRole((prev) => (prev === role ? prev : role));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => tick((prev) => prev + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setCollapsedSections(JSON.parse(saved));
    } catch {
      // silently ignore
    }
  }, []);

  // Pick sidebar config based on role (Admin sees platform view, others see user view)
  const MENU_SECTION_CONFIGS = userRole === "ADMIN"
    ? MENU_SECTION_CONFIGS_ADMIN
    : MENU_SECTION_CONFIGS_USER;

  useEffect(() => {
    if (!pathname) return;
    const configs = userRole === "ADMIN" ? MENU_SECTION_CONFIGS_ADMIN : MENU_SECTION_CONFIGS_USER;
    for (const section of configs) {
      if (!section.collapsible) continue;
      const hasActive = section.items.some((item) =>
        item.href === "/dashboard"
          ? pathname === "/dashboard"
          : item.href === "/dashboard/admin"
          ? pathname === "/dashboard/admin"
          : item.href === "/support"
          ? pathname === "/support"
          : pathname.startsWith(item.href)
      );
      if (hasActive && collapsedSections[section.id]) {
        setCollapsedSections((prev) => {
          const next = { ...prev, [section.id]: false };
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
          return next;
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, userRole]);

  const toggleSection = (id) => {
    setCollapsedSections((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  // Don't render sidebar content until we know the role (prevents wrong-sidebar flash)
  if (!userRole) {
    return (
      <>
        {isOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={onClose}
            role="presentation"
          />
        )}
        <aside
          className={`
            w-64 flex flex-col h-full
            bg-white dark:bg-[#161b22]
            border-r border-gray-100 dark:border-[#30363d]
            ${isDesktopRail
              ? "relative"
              : `fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out ${
                  isOpen ? "translate-x-0" : "-translate-x-full"
                }`
            }
          `}
        />
      </>
    );
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          role="presentation"
        />
      )}

      <aside
        className={`
          w-64 flex flex-col h-full
          bg-white dark:bg-[#161b22]
          border-r border-gray-100 dark:border-[#30363d]
          ${isDesktopRail
            ? "relative"
            : `fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out ${
                isOpen ? "translate-x-0" : "-translate-x-full"
              }`
          }
        `}
      >
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {MENU_SECTION_CONFIGS.map((section) => {
            const visibleItems = section.items.filter((item) =>
              canAccess(item.href, userRole)
            );
            if (visibleItems.length === 0) return null;
            const isCollapsed = section.collapsible && collapsedSections[section.id];

            return (
              <div key={section.id} className="mb-5">
                {section.collapsible ? (
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    aria-expanded={!isCollapsed}
                    className="mb-2 flex w-full items-center justify-between px-4 py-1 rounded-md transition group hover:bg-gray-50 dark:hover:bg-[#1c2128]"
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681] group-hover:text-gray-600 dark:group-hover:text-[#7d8590]">
                      {t(section.sectionKey)}
                    </span>
                    <ChevronDown
                      size={12}
                      strokeWidth={2.5}
                      className={`text-gray-400 dark:text-[#6e7681] transition-transform duration-200 ${
                        isCollapsed ? "-rotate-90" : "rotate-0"
                      }`}
                    />
                  </button>
                ) : (
                  <p className="mb-2 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-[#6e7681]">
                    {t(section.sectionKey)}
                  </p>
                )}

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isCollapsed ? "max-h-0 opacity-0" : "max-h-[500px] opacity-100"
                  }`}
                >
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      item.href === "/dashboard"
                        ? pathname === "/dashboard"
                        : item.href === "/dashboard/admin"
                        ? pathname === "/dashboard/admin"
                        : item.href === "/support"
                        ? pathname === "/support"
                        : pathname?.startsWith(item.href);
                    return (
                      <Link
                        key={item.titleKey}
                        href={item.href}
                        onClick={() => {
                          if (typeof window !== "undefined" && window.innerWidth < 1024) {
                            onClose?.();
                          }
                        }}
                        className={`
                          group relative mb-1 flex items-center gap-3
                          rounded-lg px-3 py-2.5
                          text-sm font-semibold transition
                          ${isActive
                            ? "bg-gradient-to-r from-[#22C55E] to-[#16a34a] text-white shadow-[0_4px_12px_rgba(34,197,94,0.3)]"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-[#7d8590] dark:hover:bg-[#1c2128] dark:hover:text-[#e6edf3]"
                          }
                        `}
                      >
                        <div
                          className={`
                            flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md
                            transition-colors
                            ${isActive
                              ? "bg-white/20"
                              : "bg-gray-100 group-hover:bg-white dark:bg-[#1c2128] dark:group-hover:bg-[#30363d]"
                            }
                          `}
                        >
                          <Icon
                            size={15}
                            strokeWidth={isActive ? 2.5 : 2}
                            className={
                              isActive
                                ? "text-white"
                                : "text-gray-500 group-hover:text-[#22C55E] dark:text-[#7d8590] dark:group-hover:text-[#22C55E]"
                            }
                          />
                        </div>
                        <span className="flex-1 truncate">{t(item.titleKey)}</span>
                        {item.badge && (
                          <span
                            className={`
                              rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums
                              ${isActive
                                ? "bg-white/25 text-white"
                                : "bg-red-50 text-red-600 dark:bg-[#2d1214] dark:text-red-400"
                              }
                            `}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="border-t border-gray-100 dark:border-[#30363d] px-4 py-3">
          <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
              </span>
              <span className="font-semibold text-gray-500 dark:text-[#7d8590] truncate">
                {t("nav.sessionActive")} · {timeAgo(sessionStart, t)}
              </span>
            </div>
            <span className="font-medium text-gray-400 dark:text-[#6e7681] flex-shrink-0 ml-2">
              {t("nav.version")}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}