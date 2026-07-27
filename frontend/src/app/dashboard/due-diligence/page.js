"use client";

import { useEffect } from "react";

export default function Page() {
  useEffect(() => {
    document.title = "Due Diligence | Real Estate Due Diligence";
  }, []);
  return <div className="p-8 text-gray-500">Coming soon.</div>;
}
