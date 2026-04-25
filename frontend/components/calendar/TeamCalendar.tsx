"use client";

import { useState } from "react";

interface LeaveRequest {
  requestId: number;
  userId: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
  userName?: string;
}

interface TeamCalendarProps {
  requests: LeaveRequest[];
}

export default function TeamCalendar({ requests }: TeamCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  // Map each day to leave requests that overlap it
  const getDayStatus = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const date = new Date(dateStr + "T00:00:00");

    const matchingRequests = requests.filter((r) => {
      const start = new Date(r.startDate + "T00:00:00");
      const end = new Date(r.endDate + "T00:00:00");
      return date >= start && date <= end;
    });

    if (matchingRequests.length === 0) return null;

    // Priority: pending > approved
    const hasPending = matchingRequests.some((r) => r.status === "Pending");
    if (hasPending) return "pending";
    const hasApproved = matchingRequests.some((r) => r.status === "Approved");
    if (hasApproved) return "approved";
    return null;
  };

  const statusStyles: Record<string, string> = {
    approved: "bg-green-100 text-green-800",
    pending: "bg-orange-100 text-orange-800",
  };

  // Build calendar grid
  const cells = [];

  // Previous month trailing days
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push(
      <div key={`prev-${i}`} className="py-2 text-center">
        <span className="text-sm text-gray-300">{daysInPrevMonth - i}</span>
      </div>
    );
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const status = getDayStatus(day);
    const todayHighlight = isToday(day);

    cells.push(
      <div key={day} className="py-1 text-center">
        <span
          className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm transition-colors ${
            todayHighlight
              ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium"
              : status
                ? statusStyles[status]
                : "text-gray-700"
          }`}
        >
          {day}
        </span>
      </div>
    );
  }

  // Next month leading days
  const remaining = 42 - cells.length;
  for (let i = 1; i <= remaining; i++) {
    cells.push(
      <div key={`next-${i}`} className="py-2 text-center">
        <span className="text-sm text-gray-300">{i}</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-1.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <p className="font-semibold text-gray-900">{monthName}</p>
        <button
          onClick={nextMonth}
          className="p-1.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="text-center">
            <span className="text-xs text-gray-400 font-medium">{d}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">{cells}</div>

      {/* Legend */}
      <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-green-200 border border-green-600" />
          <span className="text-xs text-gray-500">Approved</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-200 border border-orange-600" />
          <span className="text-xs text-gray-500">Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" />
          <span className="text-xs text-gray-500">Today</span>
        </div>
      </div>
    </div>
  );
}