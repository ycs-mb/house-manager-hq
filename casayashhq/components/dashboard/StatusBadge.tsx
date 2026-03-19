import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status: string;
  className?: string;
};

const statusStyles: Record<string, string> = {
  Success: "bg-green-100 text-green-800 border-green-200",
  success: "bg-green-100 text-green-800 border-green-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  Done: "bg-blue-100 text-blue-800 border-blue-200",
  done: "bg-blue-100 text-blue-800 border-blue-200",
  Failed: "bg-red-100 text-red-800 border-red-200",
  failed: "bg-red-100 text-red-800 border-red-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  Pending: "bg-amber-100 text-amber-800 border-amber-200",
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  "In Progress": "bg-purple-100 text-purple-800 border-purple-200",
  "in_progress": "bg-purple-100 text-purple-800 border-purple-200",
  "To Do": "bg-slate-100 text-slate-700 border-slate-200",
};

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const style =
    statusStyles[status] ?? "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <Badge
      variant="outline"
      className={cn(
        "border font-medium capitalize",
        style,
        className,
      )}
    >
      {status}
    </Badge>
  );
}
