import { PRIORITY_BY_VALUE } from "@/lib/constants";
import type { Priority } from "@/lib/db/types";
import { cn } from "@/lib/utils";

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  const meta = PRIORITY_BY_VALUE[priority];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide",
        meta.tone,
        className,
      )}
    >
      <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {meta.label}
    </span>
  );
}
