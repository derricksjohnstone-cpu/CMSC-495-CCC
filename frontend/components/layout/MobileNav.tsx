"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function MobileNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
  );
}