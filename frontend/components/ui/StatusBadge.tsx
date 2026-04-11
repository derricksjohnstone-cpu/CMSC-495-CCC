type Status = "Pending" | "Approved" | "Rejected" | "Revision Requested";

interface StatusBadgeProps {
  status: Status;
}

const statusStyles: Record<Status, string> = {
  "Pending": "bg-yellow-100 text-yellow-800",
  "Approved": "bg-green-100 text-green-800",
  "Rejected": "bg-red-100 text-red-800",
  "Revision Requested": "bg-purple-100 text-purple-800",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${statusStyles[status]}`}>
      {status}
    </span>
  );
}