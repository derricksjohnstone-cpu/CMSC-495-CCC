"use client";

import Link from "next/link";

interface HeaderProps {
  userName: string;
  showNewRequestButton?: boolean;
}

export default function Header({ userName, showNewRequestButton = false }: HeaderProps) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Hello, {userName}</h2>
        <p className="text-sm text-gray-500">{today}</p>
      </div>
      {showNewRequestButton && (
        <Link
          href="/employee/submit"
          className="px-5 py-2.5 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          New Leave Request
        </Link>
      )}
    </div>
  );
}