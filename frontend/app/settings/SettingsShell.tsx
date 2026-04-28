"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";

export default function SettingsShell({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<"employee" | "manager">("employee");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.role === "Manager") {
        setRole("manager");
      }
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-sky-50/50">
      <Sidebar role={role} />
      <main className="flex-1 p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}