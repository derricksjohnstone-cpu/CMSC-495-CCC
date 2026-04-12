interface SummaryCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  valueColor?: string;
  bgColor?: string;
  progressBar?: {
    used: number;
    total: number;
    color?: string;
  };
}

export default function SummaryCard({
  label,
  value,
  subtitle,
  valueColor = "text-gray-900",
  bgColor = "bg-green-100",
  progressBar,
}: SummaryCardProps) {
  return (
    <div className={`${bgColor} rounded-2xl p-5 min-w-[180px]`}>
      <p className="text-sm font-medium text-gray-700">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${valueColor}`}>
        {value}
      </p>
      {subtitle && (
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      )}
      {progressBar && (
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-white/60 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${progressBar.color || "bg-indigo-500"}`}
                style={{
                  width: `${(progressBar.used / progressBar.total) * 100}%`,
                }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-600">
              {progressBar.used}/{progressBar.total}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}