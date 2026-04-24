"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar";

interface HeaderProps {
  userName: string;
  showNewRequestButton?: boolean;
}

export default function Header({ userName, showNewRequestButton = false }: HeaderProps) {
  const [user, setUser] = useState({ name: "", profileImage: null as string | null });

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser({ name: parsed.name, profileImage: parsed.profileImage });
    }
  }, []);

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
          <Avatar name={user.name || userName} profileImage={user.profileImage} size="lg" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 lg:text-2xl">Hello, {userName}</h2>
          <p className="text-xs text-gray-500 lg:text-sm">{today}</p>
        </div>
      </div>
      {showNewRequestButton && (
        <Link
          href="/employee/submit"
          className="px-5 py-2.5 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <span className="hidden sm:inline">New Leave Request</span>
          <span className="sm:hidden text-lg">+</span>
        </Link>
      )}
    </div>
  );
}