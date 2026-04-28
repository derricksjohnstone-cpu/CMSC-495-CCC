"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import TeamCalendar from "@/components/calendar/TeamCalendar";

interface LeaveRequest {
  requestId: number;
  userId: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  leaveMode: string;
  status: string;
  userName?: string;
  department?: string;
}

export default function TeamCalendarPage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8000/requests/");
        const data = await res.json();
        setRequests(data);
      } catch (error) {
        console.error("Failed to fetch requests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const outThisWeek = requests.filter((r) => {
    if (r.status !== "Approved") return false;
    const start = new Date(r.startDate + "T00:00:00");
    const end = new Date(r.endDate + "T00:00:00");
    return start <= endOfWeek && end >= startOfWeek;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-gray-500">Loading...</p></div>;
  }

  return (
    <div>
      <div className="md:hidden"><Header /></div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Team Calendar</h2>
        <p className="text-sm text-gray-500 mt-1">View upcoming and approved leave across your team</p>
      </div>

      <div className="mb-8">
        <TeamCalendar requests={requests} />
      </div>

      {/* Who's out this week */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Out this week</h3>
        {outThisWeek.length === 0 ? (
          <p className="text-sm text-gray-500">No team members on leave this week.</p>
        ) : (
          <div className="space-y-3">
            {outThisWeek.map((r) => {
              const name = r.userName || `User ${r.userId}`;
              const start = new Date(r.startDate + "T00:00:00");
              const end = new Date(r.endDate + "T00:00:00");
              return (
                <div key={r.requestId} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{name}</p>
                    <p className="text-xs text-gray-500">{r.leaveType} · {r.leaveMode}</p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {start.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    {r.startDate !== r.endDate && ` - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}