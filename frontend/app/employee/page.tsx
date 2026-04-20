"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import SummaryCard from "@/components/cards/SummaryCard";
import StatusBadge from "@/components/ui/StatusBadge";

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

interface LeaveBalance {
  balanceId: number;
  userId: number;
  leaveTypeId: number;
  totalDays: number;
  usedDays: number;
  year: number;
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

export default function EmployeeDashboard() {
  const [userName, setUserName] = useState("");
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;

    const user = JSON.parse(stored);
    setUserName(user.name.split(" ")[0]); // First name only

    const fetchData = async () => {
      try {
        const [reqRes, balRes] = await Promise.all([
          fetch(`http://localhost:8000/users/${user.userId}/requests`),
          fetch(`http://localhost:8000/users/${user.userId}/balances`),
        ]);

        const reqData = await reqRes.json();
        const balData = await balRes.json();

        setRequests(reqData);
        setBalances(balData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter balances for current year
  const currentYear = new Date().getFullYear();
  const vacationBalance = balances.find(
    (b) => b.leaveTypeId === 1 && b.year === currentYear
  );
  const personalBalance = balances.find(
    (b) => b.leaveTypeId === 2 && b.year === currentYear
  );

  const vacationRemaining = vacationBalance
    ? vacationBalance.totalDays - vacationBalance.usedDays
    : 0;
  const personalRemaining = personalBalance
    ? personalBalance.totalDays - personalBalance.usedDays
    : 0;
  const vacationPercent = vacationBalance
    ? Math.round((vacationRemaining / vacationBalance.totalDays) * 100)
    : 0;
  const personalPercent = personalBalance
    ? Math.round((personalRemaining / personalBalance.totalDays) * 100)
    : 0;

  const pendingCount = requests.filter((r) => r.status === "Pending").length;

  // History: find last approved vacation and personal
  const approvedRequests = requests.filter((r) => r.status === "Approved");
  const lastVacation = approvedRequests
    .filter((r) => r.leaveType === "Vacation")
    .sort((a, b) => b.startDate.localeCompare(a.startDate))[0];
  const lastPersonal = approvedRequests
    .filter((r) => r.leaveType === "Personal")
    .sort((a, b) => b.startDate.localeCompare(a.startDate))[0];

  const totalUsedThisYear =
    (vacationBalance?.usedDays || 0) + (personalBalance?.usedDays || 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <Header userName={userName} showNewRequestButton />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <SummaryCard
          label="Vacation balance"
          value={`${vacationPercent}%`}
          subtitle={`${vacationRemaining} days remaining out of ${vacationBalance?.totalDays || 0}`}
          bgColor="bg-green-100"
          progressBar={{
            used: vacationBalance?.usedDays || 0,
            total: vacationBalance?.totalDays || 0,
            color: "bg-indigo-500",
          }}
        />
        <SummaryCard
          label="Personal balance"
          value={`${personalPercent}%`}
          subtitle={`${personalRemaining} days remaining out of ${personalBalance?.totalDays || 0}`}
          bgColor="bg-blue-100"
          progressBar={{
            used: personalBalance?.usedDays || 0,
            total: personalBalance?.totalDays || 0,
            color: "bg-emerald-500",
          }}
        />
        <SummaryCard
          label="Pending requests"
          value={pendingCount}
          subtitle={`${pendingCount} pending ${pendingCount === 1 ? "request" : "requests"}`}
          valueColor="text-orange-500"
          bgColor="bg-orange-50"
        />
      </div>

      {/* My Recent Requests & History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* My Recent Requests */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            My Recent Requests
          </h3>
          <div className="space-y-3">
            {requests.length === 0 ? (
              <p className="text-sm text-gray-500">No requests yet.</p>
            ) : (
              requests.map((request) => (
                <div
                  key={request.requestId}
                  className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-900">
                      {request.leaveType}
                    </p>
                    <StatusBadge status={request.status} />
                  </div>
                  <p className="text-sm text-gray-500">
                    Requested for {formatDate(request.startDate)}
                    {request.startDate !== request.endDate &&
                      ` - ${formatDate(request.endDate)}`}
                  </p>
                  {request.comments && (
                    <p className="text-sm text-red-500 mt-2">
                      {request.comments}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* History */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            History
          </h3>
          <div className="space-y-3">
            <div className="bg-sky-50 rounded-xl p-4 border border-sky-100">
              <p className="font-medium text-gray-900">Last Vacation Leave</p>
              {lastVacation ? (
                <>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(lastVacation.startDate)}
                    {lastVacation.startDate !== lastVacation.endDate &&
                      ` - ${formatDate(lastVacation.endDate)}`}
                  </p>
                  <p className="text-sm text-gray-500">
                    {calculateDays(lastVacation.startDate, lastVacation.endDate)} days
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-500 mt-1">No vacation taken yet</p>
              )}
            </div>

            <div className="bg-sky-50 rounded-xl p-4 border border-sky-100">
              <p className="font-medium text-gray-900">Last Personal Leave</p>
              {lastPersonal ? (
                <>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatDate(lastPersonal.startDate)}
                    {lastPersonal.startDate !== lastPersonal.endDate &&
                      ` - ${formatDate(lastPersonal.endDate)}`}
                  </p>
                  <p className="text-sm text-gray-500">
                    {calculateDays(lastPersonal.startDate, lastPersonal.endDate)} day(s)
                  </p>
                </>
              ) : (
                <p className="text-sm text-gray-500 mt-1">No personal leave taken yet</p>
              )}
            </div>

            <div className="bg-sky-50 rounded-xl p-4 border border-sky-100">
              <p className="font-medium text-gray-900">Days Used This Year</p>
              <p className="text-sm text-gray-500 mt-1">
                Total: {totalUsedThisYear} days
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}