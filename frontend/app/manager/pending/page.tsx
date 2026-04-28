"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
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

export default function PendingRequestsPage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentingOn, setCommentingOn] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");
  const [commentAction, setCommentAction] = useState<"reject" | "revision" | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8000/requests/");
        const data = await res.json();
        setRequests(data.filter((r: LeaveRequest) => r.status === "Pending"));
      } catch (error) {
        console.error("Failed to fetch requests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const sortedRequests = [...requests].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleApprove = async (requestId: number) => {
    try {
      const res = await fetch(`http://localhost:8000/requests/${requestId}/approve`, { method: "PUT" });
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.requestId !== requestId));
      }
    } catch {
      alert("Could not connect to server.");
    }
  };

  const handleRejectOrRevision = async () => {
    if (!commentingOn || !commentAction) return;
    const endpoint = commentAction === "reject"
      ? `http://localhost:8000/requests/${commentingOn}/reject`
      : `http://localhost:8000/requests/${commentingOn}/revision`;
    try {
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: commentText }),
      });
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.requestId !== commentingOn));
        setCommentingOn(null);
        setCommentText("");
        setCommentAction(null);
      }
    } catch {
      alert("Could not connect to server.");
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><p className="text-gray-500">Loading...</p></div>;
  }

  return (
    <div>
      <div className="md:hidden"><Header /></div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Pending Requests</h2>
        <p className="text-sm text-gray-500 mt-1">{requests.length} request{requests.length !== 1 && "s"} awaiting your review</p>
      </div>

      <div className="space-y-3">
        {sortedRequests.length === 0 ? (
          <div className="bg-white rounded-xl p-8 border border-gray-100 text-center">
            <p className="text-gray-500">No pending requests. You&#39;re all caught up!</p>
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
                    <StatusBadge status="Pending" />
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

                <div className="mt-4 pl-0 sm:pl-12">
                  {commentingOn === request.requestId ? (
                    <div className="space-y-3">
                      <textarea
                        className="w-full bg-gray-100 text-gray-900 p-3 rounded-xl resize-none h-20 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        placeholder={commentAction === "reject" ? "Reason for rejection..." : "What needs to be revised..."}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleRejectOrRevision}
                          disabled={!commentText.trim()}
                          className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                            commentText.trim()
                              ? commentAction === "reject"
                                ? "bg-red-500 text-white hover:bg-red-600"
                                : "bg-amber-500 text-white hover:bg-amber-600"
                              : "bg-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {commentAction === "reject" ? "Confirm Reject" : "Request Revision"}
                        </button>
                        <button
                          onClick={() => { setCommentingOn(null); setCommentText(""); setCommentAction(null); }}
                          className="px-5 py-2 rounded-full text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(request.requestId)} className="px-5 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all">Approve</button>
                      <button onClick={() => { setCommentingOn(request.requestId); setCommentAction("reject"); }} className="px-5 py-2 rounded-full text-sm font-medium text-red-500 border border-red-300 hover:bg-red-50 transition-colors">Reject</button>
                      <button onClick={() => { setCommentingOn(request.requestId); setCommentAction("revision"); }} className="px-5 py-2 rounded-full text-sm font-medium text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors">Revision</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}