import { differenceInCalendarDays, format } from "date-fns";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export function DueDate({ value, className }: { value: string | null; className?: string }) {
  if (!value) return null;
  const date = new Date(value);
  const diff = differenceInCalendarDays(date, new Date());
  const overdue = diff < 0;
  const dueSoon = diff >= 0 && diff <= 2;
  const tone = overdue
    ? "text-rose-300 bg-rose-500/10 border-rose-500/30"
    : dueSoon
      ? "text-amber-300 bg-amber-500/10 border-amber-500/30"
      : "text-muted-foreground bg-muted border-border";
  const label =
    diff === 0
      ? "Today"
      : diff === 1
        ? "Tomorrow"
        : diff === -1
          ? "Yesterday"
          : overdue
            ? `${Math.abs(diff)}d late`
            : diff <= 6
              ? `in ${diff}d`
              : format(date, "MMM d");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium",
        tone,
        className,
      )}
      title={format(date, "PPpp")}
    >
      <Calendar className="h-3 w-3" />
      {label}
    </span>
  );
}
