"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { MoreHorizontal, Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { COLUMN_TONE_BY_NAME } from "@/lib/constants";
import type { Column as ColumnT, Task, User } from "@/lib/db/types";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { TaskCard } from "./task-card";

type Props = {
  column: ColumnT;
  tasks: Task[];
  users: User[];
  onOpenTask: (taskId: string) => void;
  onCreateTask: (columnId: string) => void;
};

export function KanbanColumn({ column, tasks, users, onOpenTask, onCreateTask }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id, data: { type: "column", column } });
  const renameColumn = useStore((s) => s.renameColumn);
  const deleteColumn = useStore((s) => s.deleteColumn);
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(column.name);
  const tone = COLUMN_TONE_BY_NAME[column.name] ?? "bg-muted-foreground";

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex h-full w-72 shrink-0 flex-col rounded-lg border border-border bg-surface/60 transition-colors",
        isOver && "border-primary/40 bg-surface",
      )}
    >
      <div className="flex items-center justify-between gap-2 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className={cn("h-2 w-2 rounded-full", tone)} />
          {renaming ? (
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => {
                if (name.trim()) renameColumn(column.id, name.trim());
                setRenaming(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (name.trim()) renameColumn(column.id, name.trim());
                  setRenaming(false);
                }
                if (e.key === "Escape") {
                  setName(column.name);
                  setRenaming(false);
                }
              }}
              className="h-7 max-w-[140px] text-xs"
            />
          ) : (
            <button
              onDoubleClick={() => setRenaming(true)}
              className="truncate text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {column.name}
            </button>
          )}
          <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {tasks.length}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setRenaming(true)}>Rename</DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onSelect={() => {
                if (
                  tasks.length > 0
                    ? confirm(
                        `Delete column "${column.name}" and its ${tasks.length} task(s)? This cannot be undone.`,
                      )
                    : true
                ) {
                  deleteColumn(column.id);
                }
              }}
            >
              Delete column
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2 scrollbar-thin">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <ul className="flex flex-col gap-2">
            {tasks.map((t) => {
              const assignee = users.find((u) => u.id === t.assigneeId);
              return (
                <li key={t.id}>
                  <TaskCard task={t} assignee={assignee} onOpen={() => onOpenTask(t.id)} />
                </li>
              );
            })}
          </ul>
        </SortableContext>
        {tasks.length === 0 && (
          <div className="mt-2 rounded-md border border-dashed border-border/60 px-3 py-6 text-center text-xs text-muted-foreground">
            Drop tasks here
          </div>
        )}
      </div>

      <button
        onClick={() => onCreateTask(column.id)}
        className="m-2 flex items-center justify-center gap-1.5 rounded-md border border-dashed border-border/60 px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:border-border hover:bg-secondary hover:text-foreground"
      >
        <Plus className="h-3.5 w-3.5" />
        New task
      </button>
    </div>
  );
}
