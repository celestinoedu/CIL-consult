"use client";

import { formatDistanceToNow } from "date-fns";
import {
  ArrowRightLeft,
  Calendar,
  CheckSquare,
  CirclePlus,
  Flag,
  MessageSquare,
  Pencil,
  Tag,
  UserPlus,
} from "lucide-react";
import type { ActivityKind } from "@/lib/db/types";
import { useActivities, useStore } from "@/lib/store";

const iconByKind: Record<ActivityKind, React.ComponentType<{ className?: string }>> = {
  created: CirclePlus,
  moved: ArrowRightLeft,
  priority_changed: Flag,
  assigned: UserPlus,
  due_date_changed: Calendar,
  title_changed: Pencil,
  description_changed: Pencil,
  labels_changed: Tag,
  subtask_added: CheckSquare,
  subtask_completed: CheckSquare,
  comment_added: MessageSquare,
};

const labelByKind: Record<ActivityKind, (detail?: string, who?: string) => string> = {
  created: (_, who) => `${who ?? "Someone"} created the task`,
  moved: (detail, who) => `${who ?? "Someone"} moved to ${detail ?? "another column"}`,
  priority_changed: (detail, who) => `${who ?? "Someone"} set priority to ${detail ?? "—"}`,
  assigned: (detail, who) => `${who ?? "Someone"} assigned ${detail ?? "—"}`,
  due_date_changed: (detail, who) =>
    detail && detail !== "none"
      ? `${who ?? "Someone"} set due date`
      : `${who ?? "Someone"} cleared due date`,
  title_changed: (_, who) => `${who ?? "Someone"} edited the title`,
  description_changed: (_, who) => `${who ?? "Someone"} edited the description`,
  labels_changed: (_, who) => `${who ?? "Someone"} updated labels`,
  subtask_added: (detail, who) => `${who ?? "Someone"} added subtask "${detail ?? ""}"`,
  subtask_completed: (detail, who) => `${who ?? "Someone"} completed "${detail ?? ""}"`,
  comment_added: (_, who) => `${who ?? "Someone"} commented`,
};

export function TaskActivity({ taskId }: { taskId: string }) {
  const activities = useActivities(taskId);
  const users = useStore((s) => s.users);

  if (activities.length === 0) {
    return <p className="text-xs text-muted-foreground">No activity yet.</p>;
  }

  return (
    <ol className="flex flex-col gap-2">
      {activities.map((a) => {
        const Icon = iconByKind[a.kind];
        const who = users.find((u) => u.id === a.userId)?.name;
        return (
          <li key={a.id} className="flex items-start gap-2 text-xs text-muted-foreground">
            <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span className="flex-1">{labelByKind[a.kind](a.detail, who)}</span>
            <span className="shrink-0">
              {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
