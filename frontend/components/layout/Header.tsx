"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar";

interface HeaderProps {
  userName?: string;
  showNewRequestButton?: boolean;
}

export default function Header({ userName, showNewRequestButton = false }: HeaderProps) {
  const [user, setUser] = useState({ name: "", profileImage: null as string | null });
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser({ name: parsed.name, profileImage: parsed.profileImage });
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

      {/* Desktop: New Leave Request button */}
      {showNewRequestButton && (
        <Link
          href="/employee/submit"
          className="hidden sm:inline-block px-5 py-2.5 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          New Leave Request
        </Link>
      )}

      {/* Mobile: Hamburger menu */}
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
            <Link href="/employee" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
              Dashboard
            </Link>
            <Link href="/employee/submit" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
              Submit Request
            </Link>
            <Link href="/employee/requests" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
              My Requests
            </Link>
            <Link href="/employee/settings" className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setMenuOpen(false)}>
              Settings
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}