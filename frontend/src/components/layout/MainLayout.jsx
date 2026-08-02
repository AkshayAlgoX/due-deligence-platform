"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

const SIDEBAR_STORAGE_KEY = "dd_sidebar_open";

export default function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (saved !== null) {
        setIsSidebarOpen(saved === "true");
      } else if (typeof window !== "undefined" && window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    } catch {
      // silently ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isSidebarOpen));
    } catch {
      // silently ignore
    }
  }, [isSidebarOpen, hydrated]);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="h-screen bg-[#F6F8FB] dark:bg-[#0d1117] flex flex-col">
      <Navbar toggleSidebar={toggleSidebar} />

      <div className="flex flex-1 overflow-hidden relative">
        {/*
          Desktop sidebar rail — ALWAYS mounted.
          Uses width + translate together for smooth reveal.
          overflow-hidden prevents content bleeding while width animates.
        */}
        <div
          className={`
            hidden lg:block flex-shrink-0 overflow-hidden
            transition-[width] duration-300 ease-in-out
            ${isSidebarOpen ? "w-64" : "w-0"}
          `}
        >
          <div
            className={`
              w-64 h-full
              transition-transform duration-300 ease-in-out
              ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}
          >
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} isDesktopRail />
          </div>
        </div>

        {/* Mobile sidebar (fixed overlay, handles its own transform) */}
        <div className="lg:hidden">
          <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        </div>

        <main
          role="main"
          aria-label="Dashboard content"
          id="main-content"
          className="flex-1 overflow-y-auto p-8 transition-all duration-300 ease-in-out"
        >
          {children}
        </main>
      </div>
    </div>
  );
}