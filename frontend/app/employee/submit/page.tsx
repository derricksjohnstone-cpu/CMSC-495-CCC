"use client";

import { useState } from "react";

export default function LeaveRequestForm() {
  const [description, setDescription] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [leaveMode, setLeaveMode] = useState("Full Day");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const leaveBalances: Record<string, { used: number; total: number }> = {
    vacation: { used: 5, total: 20 },
    personal: { used: 6, total: 10 },
  };

  const currentBalance = leaveType ? leaveBalances[leaveType] : null;

  const calculateDays = () => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T00:00:00");
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (leaveMode === "Half Day") return diff * 0.5;
    return diff;
  };

  const totalDays = calculateDays();
  const isSingleDay = startDate && endDate && startDate === endDate;

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();

    const leaveTypeMap: Record<string, number> = {
      vacation: 1,
      personal: 2,
    };

    console.log("Leave request submitted:", {
      description,
      leaveTypeId: leaveTypeMap[leaveType],
      leaveMode,
      startDate,
      endDate,
    });
    setSubmitted(true);
    setTimeout(() => {
      setDescription("");
      setLeaveType("");
      setLeaveMode("Full Day");
      setStartDate("");
      setEndDate("");
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-sky-50/50 flex items-start md:items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl">

        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            New Leave Request
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Fill out the form below to submit a leave request to your manager.
          </p>
        </div>

        {submitted && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl text-sm border border-emerald-100">
            Your leave request has been submitted successfully!
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="bg-linear-to-r from-indigo-500 to-purple-500 h-1.5" />

          <form onSubmit={handleSubmit} className="p-5 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

              {/* Left column */}
              <div className="space-y-5 md:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    Description
                  </label>
                  <textarea
                    className="w-full bg-gray-100 text-gray-900 p-3.5 rounded-xl resize-none h-28 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    placeholder="Reason for leave..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    Leave Type
                  </label>
                  <div className="relative">
                    <select
                      className="w-full bg-gray-100 text-gray-900 p-3.5 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-300 pr-10"
                      value={leaveType}
                      onChange={(e) => setLeaveType(e.target.value)}
                      required
                    >
                      <option value="" disabled>
                        Select leave type
                      </option>
                      <option value="vacation">Vacation</option>
                      <option value="personal">Personal</option>
                    </select>
                    <svg
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>

                  {currentBalance && (
                    <div className="mt-3 bg-gray-100 rounded-xl p-3 flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                          style={{
                            width: `${(currentBalance.used / currentBalance.total) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-indigo-600">
                        {currentBalance.used}/{currentBalance.total}
                      </span>
                    </div>
                  )}
                </div>

                {isSingleDay && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1.5">
                      Leave Mode
                    </label>
                    <div className="flex gap-2">
                      {["Half Day", "Full Day"].map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setLeaveMode(mode)}
                          className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all ${
                            leaveMode === mode
                              ? "bg-linear-to-r from-indigo-500 to-purple-500 text-white shadow-md"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right column */}
              <div className="space-y-5 md:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    From
                  </label>
                  <input
                    type="date"
                    className="w-full bg-gray-100 text-gray-900 p-3.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (endDate && e.target.value > endDate) {
                        setEndDate("");
                        setLeaveMode("Full Day");
                      }
                      if (endDate && e.target.value !== endDate) setLeaveMode("Full Day");
                    }}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    To
                  </label>
                  <input
                    type="date"
                    className="w-full bg-gray-100 text-gray-900 p-3.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      if (e.target.value !== startDate) setLeaveMode("Full Day");
                    }}
                    required
                  />
                </div>

                {totalDays !== null && totalDays > 0 && (
                  <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                    <p className="text-sm text-indigo-600 font-medium">
                      Request summary
                    </p>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-700">
                        <span className="text-gray-500">Duration:</span>{" "}
                        <span className="font-semibold">{totalDays} {totalDays === 1 ? "day" : "days"}</span>
                      </p>
                      <p className="text-sm text-gray-700">
                        <span className="text-gray-500">Mode:</span>{" "}
                        <span className="font-semibold">{leaveMode}</span>
                      </p>
                      {leaveType && (
                        <p className="text-sm text-gray-700">
                          <span className="text-gray-500">Type:</span>{" "}
                          <span className="font-semibold capitalize">{leaveType}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom actions - full width */}
            <div className="flex flex-col-reverse sm:flex-row items-center gap-4 mt-8 pt-6 border-t border-gray-100">
              <button
                type="button"
                className="w-full sm:w-auto px-8 py-3 rounded-full border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setDescription("");
                  setLeaveType("");
                  setLeaveMode("Full Day");
                  setStartDate("");
                  setEndDate("");
                }}
              >
                Clear form
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-12 py-3 rounded-full bg-linear-to-r from-indigo-500 to-purple-500 text-white font-semibold text-sm tracking-wide hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md sm:ml-auto"
              >
                Apply
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}