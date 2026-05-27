import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-emerald-400 to-teal-700 text-[15px] font-bold text-background shadow-sm">
        c
      </span>
      <span className="text-base font-semibold tracking-tight">
        cog<span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">n</span>a
      </span>
    </div>
  );
}
