type LeaveType = "Vacation" | "Personal";

interface LeaveTypeBadgeProps {
  type: LeaveType;
}

const typeStyles: Record<LeaveType, string> = {
  "Vacation": "bg-blue-100 text-blue-800",
  "Personal": "bg-amber-100 text-amber-800",
};

export default function LeaveTypeBadge({ type }: LeaveTypeBadgeProps) {
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${typeStyles[type]}`}>
      {type}
    </span>
  );
}