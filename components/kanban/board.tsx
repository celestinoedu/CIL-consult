"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TaskCard } from "@/components/kanban/task-card";
import { KanbanColumn } from "@/components/kanban/column";
import { NewColumnDialog } from "@/components/kanban/new-column-dialog";
import { TaskModal } from "@/components/task/task-modal";
import {
  midpoint,
  useColumnsByProject,
  useStore,
  useTasksByProject,
} from "@/lib/store";

type Props = { projectId: string };

export function KanbanBoard({ projectId }: Props) {
  const columns = useColumnsByProject(projectId);
  const allTasks = useTasksByProject(projectId);
  const users = useStore((s) => s.users);
  const moveTask = useStore((s) => s.moveTask);
  const createTask = useStore((s) => s.createTask);

  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [newColumnOpen, setNewColumnOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  );

  const activeTask = activeTaskId ? allTasks.find((t) => t.id === activeTaskId) : null;

  const tasksByColumn = (columnId: string) =>
    allTasks.filter((t) => t.columnId === columnId).sort((a, b) => a.position - b.position);

  const handleQuickCreate = (columnId: string) => {
    const title = window.prompt("New task title");
    if (!title?.trim()) return;
    createTask({ projectId, columnId, title: title.trim() });
  };

  const onDragStart = (e: DragStartEvent) => {
    if (e.active.data.current?.type === "task") {
      setActiveTaskId(String(e.active.id));
    }
  };

  const onDragEnd = (e: DragEndEvent) => {
    setActiveTaskId(null);
    const { active, over } = e;
    if (!over) return;
    const activeData = active.data.current;
    if (activeData?.type !== "task") return;
    const taskId = String(active.id);

    const overData = over.data.current;
    let toColumnId: string;
    let toPosition: number;

    if (overData?.type === "column") {
      toColumnId = String(over.id);
      const colTasks = tasksByColumn(toColumnId);
      toPosition = colTasks.length === 0 ? 1024 : colTasks[colTasks.length - 1].position + 1024;
    } else if (overData?.type === "task") {
      const overTask = overData.task as { id: string; columnId: string; position: number };
      toColumnId = overTask.columnId;
      const colTasks = tasksByColumn(toColumnId).filter((t) => t.id !== taskId);
      const overIdx = colTasks.findIndex((t) => t.id === overTask.id);
      const before = overIdx > 0 ? colTasks[overIdx - 1].position : undefined;
      const after = colTasks[overIdx]?.position;
      toPosition = midpoint(before, after);
    } else {
      return;
    }

    const current = allTasks.find((t) => t.id === taskId);
    if (!current) return;
    if (current.columnId === toColumnId && current.position === toPosition) return;
    moveTask(taskId, toColumnId, toPosition);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveTaskId(null)}
    >
      <div className="flex flex-1 gap-4 overflow-x-auto overflow-y-hidden px-6 py-4 scrollbar-thin">
        {columns.map((c) => (
          <KanbanColumn
            key={c.id}
            column={c}
            tasks={tasksByColumn(c.id)}
            users={users}
            onOpenTask={setOpenTaskId}
            onCreateTask={handleQuickCreate}
          />
        ))}
        <div className="flex w-72 shrink-0 items-start pt-1">
          <Button
            variant="ghost"
            onClick={() => setNewColumnOpen(true)}
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
            Add column
          </Button>
        </div>
      </div>

      <DragOverlay>
        {activeTask ? (
          <TaskCard
            task={activeTask}
            assignee={users.find((u) => u.id === activeTask.assigneeId)}
            onOpen={() => undefined}
            isDragging
          />
        ) : null}
      </DragOverlay>

      <NewColumnDialog
        projectId={projectId}
        open={newColumnOpen}
        onOpenChange={setNewColumnOpen}
      />

      <TaskModal
        taskId={openTaskId}
        open={openTaskId !== null}
        onOpenChange={(o) => !o && setOpenTaskId(null)}
      />
    </DndContext>
  );
}
