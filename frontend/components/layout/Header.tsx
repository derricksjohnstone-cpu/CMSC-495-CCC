"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar";

interface HeaderProps {
  userName?: string;
  showNewRequestButton?: boolean;
}

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

export default function Header({ userName, showNewRequestButton = false }: HeaderProps) {
  const [user, setUser] = useState({ name: "", profileImage: null as string | null, role: "" });
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser({ name: parsed.name, profileImage: parsed.profileImage, role: parsed.role || "Employee" });
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = userName || user.name.split(" ")[0];
  const links = user.role === "Manager" ? managerLinks : employeeLinks;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-3">
        <div className="md:hidden">
          <Avatar name={user.name || displayName} profileImage={user.profileImage} size="lg" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 lg:text-2xl">Hello, {displayName}</h2>
          <p className="text-xs text-gray-500 lg:text-sm">{today}</p>
        </div>
      </div>

      {showNewRequestButton && (
        <Link
          href="/employee/submit"
          className="hidden sm:inline-block px-5 py-2.5 border border-gray-300 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-sm hover:from-indigo-600 hover:to-purple-600 transition-all"
        >
          New Leave Request
        </Link>
      )}

      <div className="relative sm:hidden" ref={menuRef}>
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
          <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
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
    </div>
  );
}