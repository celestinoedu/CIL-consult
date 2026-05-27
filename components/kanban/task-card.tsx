"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MessageSquare, ListChecks } from "lucide-react";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { DueDate } from "@/components/shared/due-date";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import type { Task, User } from "@/lib/db/types";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type Props = {
  task: Task;
  assignee: User | undefined;
  onOpen: () => void;
  isDragging?: boolean;
};

export function TaskCard({ task, assignee, onOpen, isDragging }: Props) {
  const sortable = useSortable({ id: task.id, data: { type: "task", task } });
  const style = {
    transform: CSS.Translate.toString(sortable.transform),
    transition: sortable.transition,
  };

  const subtaskCount = useStore((s) => s.subtasks.filter((st) => st.taskId === task.id).length);
  const subtaskDone = useStore(
    (s) => s.subtasks.filter((st) => st.taskId === task.id && st.completed).length,
  );
  const commentCount = useStore((s) => s.comments.filter((c) => c.taskId === task.id).length);

  return (
    <button
      ref={sortable.setNodeRef}
      style={style}
      {...sortable.attributes}
      {...sortable.listeners}
      onClick={onOpen}
      className={cn(
        "group w-full cursor-grab rounded-md border border-border bg-card p-3 text-left shadow-sm transition-all hover:border-border/80 hover:shadow-md active:cursor-grabbing",
        (isDragging || sortable.isDragging) && "opacity-50",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug">{task.title}</h3>
      </div>

      {task.labels.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {task.labels.slice(0, 3).map((l) => (
            <Badge key={l} variant="muted" className="text-[10px]">
              {l}
            </Badge>
          ))}
          {task.labels.length > 3 && (
            <Badge variant="muted" className="text-[10px]">
              +{task.labels.length - 3}
            </Badge>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <PriorityBadge priority={task.priority} />
          {task.dueDate && <DueDate value={task.dueDate} />}
        </div>
        <div className="flex shrink-0 items-center gap-2 text-[11px] text-muted-foreground">
          {subtaskCount > 0 && (
            <span className="inline-flex items-center gap-0.5">
              <ListChecks className="h-3 w-3" />
              {subtaskDone}/{subtaskCount}
            </span>
          )}
          {commentCount > 0 && (
            <span className="inline-flex items-center gap-0.5">
              <MessageSquare className="h-3 w-3" />
              {commentCount}
            </span>
          )}
          {assignee && <UserAvatar user={assignee} size="xs" />}
        </div>
      </div>
    </button>
  );
}
