"use client";

import { useState, useEffect } from "react";
import StatusBadge from "@/components/ui/StatusBadge";
import LeaveTypeBadge from "@/components/ui/LeaveTypeBadge";

interface LeaveRequest {
  requestId: number;
  userId: number;
  reviewerId: number | null;
  leaveType: string;
  startDate: string;
  endDate: string;
  leaveMode: string;
  description: string;
  status: string;
  comments: string | null;
  createdAt: string;
  updatedAt: string;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function calculateDays(start: string, end: string) {
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export default function MyRequestsPage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;
    const user = JSON.parse(stored);

    const fetchRequests = async () => {
      try {
        const res = await fetch(`http://localhost:8000/users/${user.userId}/requests`);
        const data = await res.json();
        setRequests(data);
      } catch (error) {
        console.error("Failed to fetch requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const filters = ["All", "Pending", "Approved", "Rejected", "Revision Requested"];

  const filteredRequests = filter === "All"
    ? requests
    : requests.filter((r) => r.status === filter);

  // Sort by newest first
  const sortedRequests = [...filteredRequests].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading requests...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Requests</h2>
        <p className="text-sm text-gray-500 mt-1">
          View and track all your leave requests.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map((f) => {
          const count = f === "All"
            ? requests.length
            : requests.filter((r) => r.status === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f} ({count})
            </button>
          );
        })}
      </div>

      {/* Requests list */}
      {sortedRequests.length === 0 ? (
        <div className="bg-white rounded-xl p-8 border border-gray-100 text-center">
          <p className="text-gray-500">No {filter === "All" ? "" : filter.toLowerCase()} requests found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedRequests.map((request) => {
            const days = calculateDays(request.startDate, request.endDate);
            const displayDays = request.leaveMode === "Half Day" ? days * 0.5 : days;

            return (
              <div
                key={request.requestId}
                className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <LeaveTypeBadge type={request.leaveType as "Vacation" | "Personal"} />
                    <div>
                      <p className="font-medium text-gray-900">
                        {formatDate(request.startDate)}
                        {request.startDate !== request.endDate &&
                          ` - ${formatDate(request.endDate)}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        {displayDays} {displayDays === 1 ? "day" : "days"} · {request.leaveMode}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={request.status as "Pending" | "Approved" | "Rejected" | "Revision Requested"} />
                </div>

                {request.description && (
                  <p className="text-sm text-gray-600 mt-3 pl-0 sm:pl-16">
                    {request.description}
                  </p>
                )}

                {request.comments && (
                  <div className="mt-3 pl-0 sm:pl-16 bg-red-50 rounded-lg p-3 border border-red-100">
                    <p className="text-sm text-red-600">
                      <span className="font-medium">Manager feedback:</span> {request.comments}
                    </p>
                  </div>
                )}

                <p className="text-xs text-gray-400 mt-3 pl-0 sm:pl-16">
                  Submitted {new Date(request.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}