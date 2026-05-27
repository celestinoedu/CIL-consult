"use client";

import { formatDistanceToNow } from "date-fns";
import { Calendar, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { PRIORITIES } from "@/lib/constants";
import { useStore, useTask } from "@/lib/store";
import type { Priority } from "@/lib/db/types";
import { cn } from "@/lib/utils";
import { TaskComments } from "./task-comments";
import { TaskSubtasks } from "./task-subtasks";
import { TaskActivity } from "./task-activity";

type Props = {
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TaskModal({ taskId, open, onOpenChange }: Props) {
  const task = useTask(taskId);
  const users = useStore((s) => s.users);
  const columns = useStore((s) => (task ? s.columns.filter((c) => c.projectId === task.projectId) : []));
  const updateTask = useStore((s) => s.updateTask);
  const deleteTask = useStore((s) => s.deleteTask);

  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
    }
  }, [task?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!task) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent />
      </Dialog>
    );
  }

  const assignee = users.find((u) => u.id === task.assigneeId);
  const column = columns.find((c) => c.id === task.columnId);

  const saveTitle = () => {
    const trimmed = title.trim();
    if (trimmed && trimmed !== task.title) updateTask(task.id, { title: trimmed });
    if (!trimmed) setTitle(task.title);
  };
  const saveDescription = () => {
    if (description !== task.description) updateTask(task.id, { description });
  };

  const setPriority = (priority: Priority) => updateTask(task.id, { priority });
  const setAssignee = (assigneeId: string | null) => updateTask(task.id, { assigneeId });
  const setColumn = (columnId: string) => updateTask(task.id, { columnId });
  const setDueDate = (value: string | null) => updateTask(task.id, { dueDate: value });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-0 p-0">
        <DialogTitle className="sr-only">{task.title}</DialogTitle>
        <div className="grid grid-cols-1 md:grid-cols-[1fr_240px]">
          <div className="flex max-h-[80vh] flex-col gap-5 overflow-y-auto p-6 scrollbar-thin">
            <div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    (e.currentTarget as HTMLInputElement).blur();
                  }
                }}
                className="h-auto border-none bg-transparent px-0 text-lg font-semibold shadow-none focus-visible:ring-0"
              />
              <div className="mt-1 text-xs text-muted-foreground">
                Created {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })} ·{" "}
                <span className="text-foreground">{column?.name ?? "—"}</span>
              </div>
            </div>

            <section>
              <Label className="mb-2 block">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={saveDescription}
                placeholder="Add more detail. What is the outcome? What's in scope, what's out?"
                className="min-h-[120px] resize-y"
              />
            </section>

            <Separator />

            <section>
              <Label className="mb-2 block">Subtasks</Label>
              <TaskSubtasks taskId={task.id} />
            </section>

            <Separator />

            <section>
              <Label className="mb-2 block">Comments</Label>
              <TaskComments taskId={task.id} />
            </section>

            <Separator />

            <section>
              <Label className="mb-2 block">Activity</Label>
              <TaskActivity taskId={task.id} />
            </section>
          </div>

          <aside className="flex flex-col gap-4 border-t border-border bg-surface/50 p-5 md:border-l md:border-t-0">
            <SidePanelField label="Status">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    {column?.name ?? "—"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Move to column</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {columns.map((c) => (
                    <DropdownMenuItem key={c.id} onSelect={() => setColumn(c.id)}>
                      {c.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidePanelField>

            <SidePanelField label="Priority">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <PriorityBadge priority={task.priority} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {PRIORITIES.map((p) => (
                    <DropdownMenuItem key={p.value} onSelect={() => setPriority(p.value)}>
                      <PriorityBadge priority={p.value} />
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidePanelField>

            <SidePanelField label="Assignee">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    {assignee ? (
                      <span className="flex items-center gap-2">
                        <UserAvatar user={assignee} size="xs" />
                        <span className="truncate">{assignee.name}</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => setAssignee(null)}>
                    Unassigned
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {users.map((u) => (
                    <DropdownMenuItem key={u.id} onSelect={() => setAssignee(u.id)}>
                      <UserAvatar user={u} size="xs" />
                      <span className="ml-2">{u.name}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidePanelField>

            <SidePanelField label="Due date">
              <div className="flex items-center gap-1">
                <Input
                  type="date"
                  value={task.dueDate ? task.dueDate.slice(0, 10) : ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setDueDate(v ? new Date(v + "T12:00:00").toISOString() : null);
                  }}
                  className="h-8 text-xs"
                />
                {task.dueDate && (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDueDate(null)}>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
              </div>
            </SidePanelField>

            <SidePanelField label="Labels">
              <LabelsEditor
                value={task.labels}
                onChange={(labels) => updateTask(task.id, { labels })}
              />
            </SidePanelField>

            <div className="mt-auto pt-3">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => {
                  if (confirm("Delete this task? This cannot be undone.")) {
                    deleteTask(task.id);
                    onOpenChange(false);
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete task
              </Button>
            </div>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SidePanelField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}

function LabelsEditor({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [input, setInput] = useState("");
  const add = () => {
    const trimmed = input.trim().toLowerCase();
    if (!trimmed) return;
    if (value.includes(trimmed)) {
      setInput("");
      return;
    }
    onChange([...value, trimmed]);
    setInput("");
  };
  const remove = (l: string) => onChange(value.filter((v) => v !== l));
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1">
        {value.map((l) => (
          <button
            key={l}
            onClick={() => remove(l)}
            className={cn(
              "inline-flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive",
            )}
            title="Remove"
          >
            {l}
            <span className="opacity-60">×</span>
          </button>
        ))}
      </div>
      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
        placeholder="Add label…"
        className="h-7 text-xs"
      />
    </div>
  );
}
