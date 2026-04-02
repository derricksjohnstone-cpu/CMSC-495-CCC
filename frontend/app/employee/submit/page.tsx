"use client";

import { useState, useRef, useEffect } from "react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const CENTER_INDEX = Math.floor(VISIBLE_ITEMS / 2);

function ScrollColumn({
  items,
  selected,
  onSelect,
}: {
  items: string[];
  selected: string;
  onSelect: (val: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedIndex = items.indexOf(selected);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = selectedIndex * ITEM_HEIGHT;
    }
  }, [selectedIndex]);

  const handleScroll = () => {
    if (containerRef.current) {
      const scrollTop = containerRef.current.scrollTop;
      const index = Math.round(scrollTop / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
      if (items[clampedIndex] !== selected) {
        onSelect(items[clampedIndex]);
      }
    }
  };

  return (
    <div className="relative" style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}>
      <div
        className="absolute left-0 right-0 border-y-2 border-indigo-400 rounded-lg bg-indigo-50 pointer-events-none z-10"
        style={{
          top: CENTER_INDEX * ITEM_HEIGHT,
          height: ITEM_HEIGHT,
        }}
      />
      <div
        ref={containerRef}
        className="h-full overflow-y-auto scrollbar-hide"
        onScroll={handleScroll}
        style={{
          scrollSnapType: "y mandatory",
          paddingTop: CENTER_INDEX * ITEM_HEIGHT,
          paddingBottom: CENTER_INDEX * ITEM_HEIGHT,
        }}
      >
        {items.map((item, i) => {
          const isSelected = item === selected;
          return (
            <div
              key={i}
              className={`flex items-center justify-center cursor-pointer transition-all ${
                isSelected
                  ? "text-gray-900 font-semibold text-lg"
                  : "text-gray-400 text-sm"
              }`}
              style={{
                height: ITEM_HEIGHT,
                scrollSnapAlign: "start",
              }}
              onClick={() => {
                onSelect(item);
                if (containerRef.current) {
                  containerRef.current.scrollTo({
                    top: i * ITEM_HEIGHT,
                    behavior: "smooth",
                  });
                }
              }}
            >
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DatePickerModal({
  isOpen,
  onClose,
  onConfirm,
  initialDate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: string) => void;
  initialDate?: string;
}) {
  const now = new Date();
  const parsed = initialDate ? new Date(initialDate) : now;
  const validDate = !isNaN(parsed.getTime()) ? parsed : now;

  const [month, setMonth] = useState(MONTHS[validDate.getMonth()]);
  const [day, setDay] = useState(String(validDate.getDate()));
  const [year, setYear] = useState(String(validDate.getFullYear()));

  const currentYear = now.getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => String(currentYear + i));
  const daysInMonth = new Date(
    parseInt(year),
    MONTHS.indexOf(month) + 1,
    0
  ).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));

  const displayDay = parseInt(day) > daysInMonth ? String(daysInMonth) : day;

  if (!isOpen) return null;

  const handleConfirm = () => {
    const finalDay = parseInt(day) > daysInMonth ? String(daysInMonth) : day;
    const monthIndex = MONTHS.indexOf(month);
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${finalDay.padStart(2, "0")}`;
    onConfirm(dateStr);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-80 overflow-hidden">
        <div className="h-1.5 bg-linear-to-r from-indigo-400 to-purple-400 mx-auto w-12 rounded-full mt-3" />

        <div className="p-6">
          <div
            className="grid grid-cols-3 gap-2"
            style={{
              maskImage:
                "linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)",
            }}
          >
            <ScrollColumn
              items={MONTHS}
              selected={month}
              onSelect={setMonth}
            />
            <ScrollColumn items={days} selected={displayDay} onSelect={setDay} />
            <ScrollColumn items={years} selected={year} onSelect={setYear} />
          </div>
        </div>

        <div className="px-6 pb-6 space-y-3">
          <button
            onClick={handleConfirm}
            className="w-full py-3 rounded-full bg-linear-to-r from-indigo-500 to-purple-500 text-white font-semibold text-sm tracking-wide hover:from-indigo-600 hover:to-purple-600 transition-all"
          >
            Confirm
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-full border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LeaveRequestForm() {
  const [description, setDescription] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [leaveMode, setLeaveMode] = useState("Full Day");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState<
    "start" | "end" | null
  >(null);

  const leaveBalances: Record<string, { used: number; total: number }> = {
    vacation: { used: 5, total: 20 },
    personal: { used: 6, total: 10 },
  };

  const currentBalance = leaveType ? leaveBalances[leaveType] : null;

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateDays = () => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate + "T00:00:00");
    const end = new Date(endDate + "T00:00:00");
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (leaveMode === "Half Day") return diff * 0.5;
    return diff;
  };

  const totalDays = calculateDays();

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    console.log("Leave request submitted:", {
      description,
      leaveType,
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
              </div>

              {/* Right column */}
              <div className="space-y-5 md:space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    From
                  </label>
                  <button
                    type="button"
                    onClick={() => setDatePickerTarget("start")}
                    className="w-full bg-gray-100 p-3.5 rounded-xl text-left text-sm flex items-center justify-between hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    <span className={startDate ? "text-gray-900" : "text-gray-400"}>
                      {startDate ? formatDisplayDate(startDate) : "DD / MM / YYYY"}
                    </span>
                    <svg
                      className="w-5 h-5 text-indigo-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">
                    To
                  </label>
                  <button
                    type="button"
                    onClick={() => setDatePickerTarget("end")}
                    className="w-full bg-gray-100 p-3.5 rounded-xl text-left text-sm flex items-center justify-between hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    <span className={endDate ? "text-gray-900" : "text-gray-400"}>
                      {endDate ? formatDisplayDate(endDate) : "DD / MM / YYYY"}
                    </span>
                    <svg
                      className="w-5 h-5 text-indigo-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
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

      <DatePickerModal
        isOpen={datePickerTarget !== null}
        onClose={() => setDatePickerTarget(null)}
        onConfirm={(date) => {
          if (datePickerTarget === "start") {
            setStartDate(date);
            if (endDate && date > endDate) setEndDate("");
          } else {
            setEndDate(date);
          }
        }}
        initialDate={
          datePickerTarget === "start" ? startDate : endDate
        }
      />

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}