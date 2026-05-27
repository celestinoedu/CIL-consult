import type { Priority } from "./db/types";

export const PRIORITIES: { value: Priority; label: string; tone: string }[] = [
  { value: "low", label: "Low", tone: "text-slate-300 bg-slate-500/15 border-slate-500/30" },
  { value: "medium", label: "Medium", tone: "text-sky-300 bg-sky-500/15 border-sky-500/30" },
  { value: "high", label: "High", tone: "text-amber-300 bg-amber-500/15 border-amber-500/30" },
  { value: "critical", label: "Critical", tone: "text-rose-300 bg-rose-500/15 border-rose-500/30" },
];

export const DEFAULT_COLUMNS = [
  { name: "Backlog", tone: "bg-slate-500" },
  { name: "Todo", tone: "bg-sky-500" },
  { name: "In Progress", tone: "bg-amber-500" },
  { name: "Review", tone: "bg-violet-500" },
  { name: "Done", tone: "bg-emerald-500" },
] as const;

export const COLUMN_TONE_BY_NAME: Record<string, string> = Object.fromEntries(
  DEFAULT_COLUMNS.map((c) => [c.name, c.tone]),
);

export const PRIORITY_BY_VALUE = Object.fromEntries(
  PRIORITIES.map((p) => [p.value, p]),
) as Record<Priority, (typeof PRIORITIES)[number]>;
