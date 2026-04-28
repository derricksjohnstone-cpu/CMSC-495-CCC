"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const employeeLinks = [
  { label: "Dashboard", href: "/employee" },
  { label: "Submit Request", href: "/employee/submit" },
  { label: "My Requests", href: "/employee/requests" },
  { label: "Settings", href: "/settings" },
];

const managerLinks = [
  { label: "Dashboard", href: "/manager" },
  { label: "Pending Requests", href: "/manager/pending" },
  { label: "Team Calendar", href: "/manager/calendar" },
  { label: "All Requests", href: "/manager/requests" },
  { label: "Settings", href: "/settings" },
];

export default function MobileNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [role, setRole] = useState<"employee" | "manager">("employee");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.role === "Manager") {
        setRole("manager");
      }
    }

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const links = role === "manager" ? managerLinks : employeeLinks;

  return (
    <div className="sm:hidden relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {menuOpen && (
        <div className="absolute right-4 top-12 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}