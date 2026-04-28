"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import StatusBadge from "@/components/ui/StatusBadge";
import LeaveTypeBadge from "@/components/ui/LeaveTypeBadge";

interface LeaveRequest {
  requestId: number;
  userId: number;
  leaveType: string;
  startDate: string;
  endDate: string;
  leaveMode: string;
  description: string;
  status: string;
  comments: string | null;
  createdAt: string;
  userName?: string;
  department?: string;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function calculateDays(start: string, end: string) {
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase();
}

const avatarColors = ["bg-purple-500", "bg-emerald-500", "bg-orange-500", "bg-blue-500", "bg-pink-500", "bg-teal-500"];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export default function AllRequestsPage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

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

  const filters = ["All", "Pending", "Approved", "Rejected"];

  const filteredRequests = filter === "All"
    ? requests
    : requests.filter((r) => r.status === filter);

  const sortedRequests = [...filteredRequests].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-gray-500">Loading...</p></div>;
  }

  return (
    <div>
      <div className="md:hidden"><Header /></div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">All Requests</h2>
        <p className="text-sm text-gray-500 mt-1">Complete history of leave requests across your team</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {filters.map((f) => {
          const count = f === "All" ? requests.length : requests.filter((r) => r.status === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === f ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f} ({count})
            </button>
          );
        })}
      </div>

      {/* Request Cards — read-only, no action buttons */}
      <div className="space-y-3">
        {sortedRequests.length === 0 ? (
          <div className="bg-white rounded-xl p-8 border border-gray-100 text-center">
            <p className="text-gray-500">No {filter === "All" ? "" : filter.toLowerCase()} requests found.</p>
          </div>
        ) : (
          sortedRequests.map((request) => {
            const days = calculateDays(request.startDate, request.endDate);
            const displayDays = request.leaveMode === "Half Day" ? days * 0.5 : days;
            const name = request.userName || `User ${request.userId}`;

            return (
              <div key={request.requestId} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full ${getAvatarColor(name)} flex items-center justify-center text-white text-sm font-medium`}>
                      {getInitials(name)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{name}</p>
                      <p className="text-xs text-gray-500">{request.department || "IT Department"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <LeaveTypeBadge type={request.leaveType as "Vacation" | "Personal"} />
                    <StatusBadge status={request.status as "Pending" | "Approved" | "Rejected" | "Revision Requested"} />
                  </div>
                </div>

                <div className="mt-3 pl-0 sm:pl-12">
                  <p className="text-sm text-gray-900">
                    {formatDate(request.startDate)}
                    {request.startDate !== request.endDate && ` - ${formatDate(request.endDate)}`}
                  </p>
                  <p className="text-sm text-gray-500">{displayDays} {displayDays === 1 ? "day" : "days"} · {request.leaveMode}</p>
                  {request.description && <p className="text-sm text-gray-500 mt-1">{request.description}</p>}
                </div>

                {request.comments && request.status !== "Pending" && (
                  <div className="mt-3 pl-0 sm:pl-12 bg-red-50 rounded-lg p-3 border border-red-100">
                    <p className="text-sm text-red-600"><span className="font-medium">Manager feedback:</span> {request.comments}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}