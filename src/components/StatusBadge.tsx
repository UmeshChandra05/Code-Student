import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "ACCEPTED" | "WRONG_ANSWER" | "TIME_LIMIT_EXCEEDED" | "RUNTIME_ERROR" | "COMPILATION_ERROR" | "PENDING";
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  ACCEPTED: { label: "Accepted", className: "bg-success/10 text-success border-success/20" },
  WRONG_ANSWER: { label: "Wrong Answer", className: "bg-destructive/10 text-destructive border-destructive/20" },
  TIME_LIMIT_EXCEEDED: { label: "TLE", className: "bg-warning/10 text-warning border-warning/20" },
  RUNTIME_ERROR: { label: "Runtime Error", className: "bg-destructive/10 text-destructive border-destructive/20" },
  COMPILATION_ERROR: { label: "Compile Error", className: "bg-destructive/10 text-destructive border-destructive/20" },
  PENDING: { label: "Pending", className: "bg-muted text-muted-foreground border-border" },
};

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status] || statusConfig.PENDING;
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border", config.className, className)}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
