import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  hint,
  tone,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: "default" | "accent" | "warning" | "danger";
  icon?: React.ReactNode;
}) {
  const toneClass = {
    default: "text-foreground",
    accent: "text-accent",
    warning: "text-amber-300",
    danger: "text-rose-300",
  }[tone ?? "default"];
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="uppercase tracking-wider">{label}</span>
        {icon && <span className="text-muted-foreground">{icon}</span>}
      </div>
      <div className={cn("mt-2 text-3xl font-semibold tracking-tight", toneClass)}>{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
