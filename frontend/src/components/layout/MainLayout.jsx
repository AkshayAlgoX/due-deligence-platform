"use client";

import React, { useState } from 'react';
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-[#F6F8FB] flex flex-col">

      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex flex-1 overflow-hidden">

        <Sidebar isOpen={isSidebarOpen} />

        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden pb-8">
          {children}
        </main>

      </div>

    </div>
  );
}