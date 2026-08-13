"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Search,
  Home,
  FileText,
  Building2,
  BarChart3,
  Settings,
  Bell,
  Users,
  Activity,
  CreditCard,
  Mail,
  BookOpen,
  Shield,
  Sun,
  Moon,
  LogOut,
  Sparkles,
  Plus,
  Download,
  MessageSquare,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { getUser } from "@/utils/helpers";
import { useAuth } from "@/hooks/useAuth";
import { searchProperties } from "@/services/propertyService";

export default function CommandPalette() {
  const router = useRouter();
  const { logout } = useAuth();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [propertyResults, setPropertyResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [user, setUser] = useState(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setUser(getUser());
    if (typeof document !== "undefined") {
      setIsDark(document.documentElement.classList.contains("dark"));
    }
  }, [open]);

  // ⌨️ Toggle with Cmd+K / Ctrl+K / F1
  useEffect(() => {
    const down = (e) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "F1") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Reset search when closing
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setSearch("");
        setPropertyResults([]);
      }, 200);
    }
  }, [open]);

  // Debounced property search
  useEffect(() => {
    if (!search || search.length < 2) {
      setPropertyResults([]);
      return;
    }

    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchProperties({
          query: search,
          page: 0,
          size: 5,
        });
        const list =
          results?.content ||
          results?.properties ||
          results?.data ||
          (Array.isArray(results) ? results : []) ||
          [];
        setPropertyResults(list.slice(0, 5));
      } catch {
        setPropertyResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [search]);

  const runCommand = useCallback((cb) => {
    setOpen(false);
    setTimeout(cb, 100);
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      html.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
    toast.success(`Switched to ${isDark ? "Light" : "Dark"} mode`);
  };

  const isAdmin = user?.role === "ADMIN";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-[15%] z-[101] w-full max-w-[640px] -translate-x-1/2 px-4"
          >
            <Command
              label="Command Palette"
              className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0d1117] shadow-2xl shadow-black/20 dark:shadow-black/60 overflow-hidden"
              shouldFilter={false}
            >
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-200 dark:border-white/[0.06]">
                <Search className="h-4 w-4 text-gray-400 dark:text-white/40 flex-shrink-0" />
                <Command.Input
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Type a command or search..."
                  className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30"
                />
                {searching && (
                  <Loader2 className="h-3.5 w-3.5 text-gray-400 animate-spin" />
                )}
                <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/[0.08] border border-gray-200 dark:border-white/10 text-[10px] font-mono text-gray-500 dark:text-white/40">
                  ESC
                </kbd>
              </div>

              <Command.List className="max-h-[420px] overflow-y-auto p-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300 dark:scrollbar-thumb-white/10">
                <Command.Empty className="py-8 text-center text-sm text-gray-500 dark:text-white/40">
                  No results found.
                </Command.Empty>

                {/* Property search results */}
                {propertyResults.length > 0 && (
                  <Command.Group heading="Properties" className="cmd-group">
                    {propertyResults.map((p) => (
                      <CommandItem
                        key={p.id}
                        value={`property-${p.id}-${p.address}`}
                        onSelect={() =>
                          runCommand(() =>
                            router.push(`/dashboard/property-search/${p.id}`)
                          )
                        }
                        icon={<Building2 className="h-4 w-4 text-emerald-500" />}
                        title={p.address || "Untitled property"}
                        subtitle={
                          [p.city, p.state, p.propertyType]
                            .filter(Boolean)
                            .join(" · ") || "Property"
                        }
                        shortcut="↵"
                      />
                    ))}
                  </Command.Group>
                )}

                {/* Navigation */}
                <Command.Group heading="Navigation" className="cmd-group">
                  <CommandItem
                    value="nav-dashboard"
                    onSelect={() => runCommand(() => router.push("/dashboard"))}
                    icon={<Home className="h-4 w-4" />}
                    title="Dashboard"
                    shortcut="G D"
                  />
                  <CommandItem
                    value="nav-property-search"
                    onSelect={() =>
                      runCommand(() => router.push("/dashboard/property-search"))
                    }
                    icon={<Search className="h-4 w-4" />}
                    title="Property Search"
                    shortcut="G P"
                  />
                  <CommandItem
                    value="nav-reports"
                    onSelect={() => runCommand(() => router.push("/reports"))}
                    icon={<FileText className="h-4 w-4" />}
                    title="Reports"
                    shortcut="G R"
                  />
                  <CommandItem
                    value="nav-notifications"
                    onSelect={() =>
                      runCommand(() => router.push("/dashboard/notifications"))
                    }
                    icon={<Bell className="h-4 w-4" />}
                    title="Notifications"
                    shortcut="G N"
                  />
                  {!isAdmin && (
                    <CommandItem
                      value="nav-billing"
                      onSelect={() =>
                        runCommand(() => router.push("/dashboard/billing"))
                      }
                      icon={<CreditCard className="h-4 w-4" />}
                      title="Billing & Subscription"
                      shortcut="G B"
                    />
                  )}
                  <CommandItem
                    value="nav-settings"
                    onSelect={() =>
                      runCommand(() => router.push("/dashboard/settings"))
                    }
                    icon={<Settings className="h-4 w-4" />}
                    title="Settings"
                    shortcut="G S"
                  />
                </Command.Group>

                {/* Actions */}
                <Command.Group heading="Actions" className="cmd-group">
                  <CommandItem
                    value="action-add-property"
                    onSelect={() =>
                      runCommand(() => router.push("/dashboard/property-search"))
                    }
                    icon={<Plus className="h-4 w-4 text-emerald-500" />}
                    title="Add new property"
                  />
                  <CommandItem
                    value="action-generate-report"
                    onSelect={() => runCommand(() => router.push("/reports"))}
                    icon={<Download className="h-4 w-4 text-blue-500" />}
                    title="Generate report"
                  />
                  <CommandItem
                    value="action-ask-ai"
                    onSelect={() =>
                      runCommand(() => {
                        const btn = document.querySelector(
                          "[title='AI Property Assistant']"
                        );
                        if (btn) btn.click();
                        else toast.info("Open a property to chat with AI");
                      })
                    }
                    icon={<Sparkles className="h-4 w-4 text-emerald-500" />}
                    title="Ask AI Assistant"
                  />
                </Command.Group>

                {/* Admin */}
                {isAdmin && (
                  <Command.Group heading="Admin" className="cmd-group">
                    <CommandItem
                      value="admin-dashboard"
                      onSelect={() =>
                        runCommand(() => router.push("/dashboard/admin"))
                      }
                      icon={<Shield className="h-4 w-4 text-violet-500" />}
                      title="Admin Dashboard"
                    />
                    <CommandItem
                      value="admin-users"
                      onSelect={() =>
                        runCommand(() =>
                          router.push("/dashboard/admin/users")
                        )
                      }
                      icon={<Users className="h-4 w-4 text-violet-500" />}
                      title="Manage Users"
                    />
                    <CommandItem
                      value="admin-analytics"
                      onSelect={() =>
                        runCommand(() =>
                          router.push("/dashboard/admin/analytics")
                        )
                      }
                      icon={<BarChart3 className="h-4 w-4 text-violet-500" />}
                      title="Analytics"
                    />
                    <CommandItem
                      value="admin-system"
                      onSelect={() =>
                        runCommand(() =>
                          router.push("/dashboard/admin/system")
                        )
                      }
                      icon={<Activity className="h-4 w-4 text-violet-500" />}
                      title="System Health"
                    />
                  </Command.Group>
                )}

                {/* Preferences */}
                <Command.Group heading="Preferences" className="cmd-group">
                  <CommandItem
                    value="pref-theme"
                    onSelect={() => runCommand(toggleTheme)}
                    icon={
                      isDark ? (
                        <Sun className="h-4 w-4 text-amber-500" />
                      ) : (
                        <Moon className="h-4 w-4 text-indigo-500" />
                      )
                    }
                    title={
                      isDark ? "Switch to Light Mode" : "Switch to Dark Mode"
                    }
                  />
                </Command.Group>

                {/* Help */}
                <Command.Group heading="Help & Support" className="cmd-group">
                  <CommandItem
                    value="help-docs"
                    onSelect={() => runCommand(() => router.push("/docs"))}
                    icon={<BookOpen className="h-4 w-4" />}
                    title="Documentation"
                  />
                  <CommandItem
                    value="help-contact"
                    onSelect={() => runCommand(() => router.push("/contact"))}
                    icon={<Mail className="h-4 w-4" />}
                    title="Contact Support"
                  />
                  <CommandItem
                    value="help-bug"
                    onSelect={() =>
                      runCommand(() => {
                        window.open(
                          "https://github.com/springboardmentor198/team-03",
                          "_blank"
                        );
                      })
                    }
                    icon={<MessageSquare className="h-4 w-4" />}
                    title="Report a bug"
                  />
                </Command.Group>

                {/* Account */}
                <Command.Group heading="Account" className="cmd-group">
                  <CommandItem
                    value="account-logout"
                    onSelect={() => runCommand(logout)}
                    icon={<LogOut className="h-4 w-4 text-red-500" />}
                    title="Log out"
                    danger
                  />
                </Command.Group>
              </Command.List>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-white/[0.06] bg-gray-50 dark:bg-[#161b22]">
                <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-white/40">
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-white/[0.08] border border-gray-200 dark:border-white/10 text-[10px] font-mono">
                      ↑↓
                    </kbd>
                    <span>Navigate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-white/[0.08] border border-gray-200 dark:border-white/10 text-[10px] font-mono">
                      ↵
                    </kbd>
                    <span>Select</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-white/30">
                  <Sparkles className="h-3 w-3 text-emerald-500" />
                  <span>Command Palette</span>
                </div>
              </div>
            </Command>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function CommandItem({ onSelect, icon, title, subtitle, shortcut, danger, value }) {
  return (
    <Command.Item
      value={value}
      onSelect={onSelect}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors ${
        danger
          ? "text-red-600 dark:text-red-400 aria-selected:bg-red-50 dark:aria-selected:bg-red-500/10"
          : "text-gray-700 dark:text-white/80 aria-selected:bg-emerald-50 dark:aria-selected:bg-emerald-500/10 aria-selected:text-emerald-700 dark:aria-selected:text-emerald-300"
      }`}
    >
      <div className="flex-shrink-0 h-7 w-7 flex items-center justify-center rounded-md bg-gray-100 dark:bg-white/[0.06]">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="truncate font-medium">{title}</div>
        {subtitle && (
          <div className="truncate text-[11px] text-gray-500 dark:text-white/40">
            {subtitle}
          </div>
        )}
      </div>
      {shortcut && (
        <kbd className="flex-shrink-0 px-1.5 py-0.5 rounded bg-gray-100 dark:bg-white/[0.08] border border-gray-200 dark:border-white/10 text-[10px] font-mono text-gray-500 dark:text-white/40">
          {shortcut}
        </kbd>
      )}
      <ArrowRight className="hidden aria-selected:block h-3 w-3 text-gray-400 dark:text-white/30" />
    </Command.Item>
  );
}