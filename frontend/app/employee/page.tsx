"use client";

import Header from "@/components/layout/Header";
import SummaryCard from "@/components/cards/SummaryCard";
import StatusBadge from "@/components/ui/StatusBadge";

// TODO: Replace with real API data
const mockUser = {
  name: "Sara",
};

const mockBalances = {
  vacation: { used: 5, total: 20 },
  personal: { used: 6, total: 10 },
};

const mockRequests = [
  {
    requestId: 1,
    leaveType: "Vacation",
    startDate: "2026-05-20",
    endDate: "2026-05-24",
    status: "Pending" as const,
  },
  {
    requestId: 2,
    leaveType: "Personal",
    startDate: "2026-04-30",
    endDate: "2026-04-30",
    status: "Approved" as const,
  },
  {
    requestId: 3,
    leaveType: "Vacation",
    startDate: "2026-04-15",
    endDate: "2026-04-15",
    status: "Rejected" as const,
    managerComment: "Too many people out that week.",
  },
];

const mockHistory = {
  lastVacation: {
    startDate: "2026-03-12",
    endDate: "2026-03-18",
    days: 5,
  },
  lastPersonal: {
    startDate: "2026-01-09",
    endDate: "2026-01-09",
    days: 1,
  },
  totalUsedThisYear: 10,
};

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
  const pendingCount = mockRequests.filter((r) => r.status === "Pending").length;
  const vacationPercent = Math.round(
    ((mockBalances.vacation.total - mockBalances.vacation.used) / mockBalances.vacation.total) * 100
  );
  const personalPercent = Math.round(
    ((mockBalances.personal.total - mockBalances.personal.used) / mockBalances.personal.total) * 100
  );

  return (
    <div>
      <Header userName={mockUser.name} showNewRequestButton />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <SummaryCard
          label="Vacation balance"
          value={`${vacationPercent}%`}
          subtitle={`${mockBalances.vacation.total - mockBalances.vacation.used} days remaining out of ${mockBalances.vacation.total}`}
          bgColor="bg-green-100"
          progressBar={{
            used: mockBalances.vacation.used,
            total: mockBalances.vacation.total,
            color: "bg-indigo-500",
          }}
        />
        <SummaryCard
          label="Personal balance"
          value={`${personalPercent}%`}
          subtitle={`${mockBalances.personal.total - mockBalances.personal.used} days remaining out of ${mockBalances.personal.total}`}
          bgColor="bg-blue-100"
          progressBar={{
            used: mockBalances.personal.used,
            total: mockBalances.personal.total,
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
            {mockRequests.map((request) => (
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
                {request.managerComment && (
                  <p className="text-sm text-red-500 mt-2">
                    {request.managerComment}
                  </p>
                )}
              </div>
            ))}
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
              <p className="text-sm text-gray-500 mt-1">
                {formatDate(mockHistory.lastVacation.startDate)} -{" "}
                {formatDate(mockHistory.lastVacation.endDate)}
              </p>
              <p className="text-sm text-gray-500">
                {mockHistory.lastVacation.days} days
              </p>
            </div>

            <div className="bg-sky-50 rounded-xl p-4 border border-sky-100">
              <p className="font-medium text-gray-900">Last Personal Leave</p>
              <p className="text-sm text-gray-500 mt-1">
                {formatDate(mockHistory.lastPersonal.startDate)}
              </p>
              <p className="text-sm text-gray-500">
                {mockHistory.lastPersonal.days} day
              </p>
            </div>

            <div className="bg-sky-50 rounded-xl p-4 border border-sky-100">
              <p className="font-medium text-gray-900">Days Used This Year</p>
              <p className="text-sm text-gray-500 mt-1">
                Total: {mockHistory.totalUsedThisYear} days
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}