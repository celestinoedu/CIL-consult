"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useStore, useSubtasks } from "@/lib/store";
import { cn } from "@/lib/utils";


export function TaskSubtasks({ taskId }: { taskId: string }) {
  const subtasks = useSubtasks(taskId);
  const addSubtask = useStore((s) => s.addSubtask);
  const toggleSubtask = useStore((s) => s.toggleSubtask);
  const deleteSubtask = useStore((s) => s.deleteSubtask);
  const [draft, setDraft] = useState("");
  const completed = subtasks.filter((s) => s.completed).length;
  const total = subtasks.length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="flex flex-col gap-2">
      {total > 0 && (
        <div className="flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-accent transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[11px] text-muted-foreground">
            {completed}/{total}
          </span>
        </div>
      )}

      <ul className="flex flex-col">
        {subtasks.map((st) => (
          <li
            key={st.id}
            className="group flex items-center gap-2 rounded px-1 py-1 text-sm transition-colors hover:bg-secondary/60"
          >
            <Checkbox
              checked={st.completed}
              onCheckedChange={() => toggleSubtask(st.id)}
              aria-label={`Toggle ${st.title}`}
            />
            <span
              className={cn(
                "flex-1 truncate text-sm",
                st.completed && "text-muted-foreground line-through",
              )}
            >
              {st.title}
            </span>
            <button
              className="opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => deleteSubtask(st.id)}
              aria-label="Delete subtask"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
            </button>
          </li>
        ))}
      </ul>

      <form
        className="flex items-center gap-1"
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = draft.trim();
          if (!trimmed) return;
          addSubtask(taskId, trimmed);
          setDraft("");
        }}
      >
        <Plus className="h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add a subtask"
          className="h-7 border-none bg-transparent text-sm shadow-none focus-visible:ring-0"
        />
      </form>
    </div>
  );
}
