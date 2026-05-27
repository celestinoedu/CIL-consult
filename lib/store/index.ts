"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DEFAULT_COLUMNS } from "../constants";
import { makeSeed, type SeedData } from "../db/seed";
import type {
  Activity,
  ActivityKind,
  Column,
  Comment,
  Organization,
  Priority,
  Project,
  ProjectCreateInput,
  Subtask,
  Task,
  TaskCreateInput,
  User,
} from "../db/types";
import { uid } from "../utils";

type Entities = {
  organization: Organization;
  users: User[];
  currentUserId: string;
  projects: Project[];
  columns: Column[];
  tasks: Task[];
  subtasks: Subtask[];
  comments: Comment[];
  activities: Activity[];
};

type Actions = {
  reseed: () => void;

  createProject: (input: ProjectCreateInput) => Project;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  toggleProjectFavorite: (id: string) => void;

  createColumn: (projectId: string, name: string) => Column;
  renameColumn: (id: string, name: string) => void;
  deleteColumn: (id: string) => void;
  reorderColumns: (projectId: string, ids: string[]) => void;

  createTask: (input: TaskCreateInput) => Task;
  updateTask: (id: string, patch: Partial<Task>, opts?: { silent?: boolean }) => void;
  moveTask: (id: string, toColumnId: string, toPosition: number) => void;
  deleteTask: (id: string) => void;

  addSubtask: (taskId: string, title: string) => Subtask;
  toggleSubtask: (id: string) => void;
  renameSubtask: (id: string, title: string) => void;
  deleteSubtask: (id: string) => void;

  addComment: (taskId: string, content: string) => Comment;
  deleteComment: (id: string) => void;
};

type Store = Entities & Actions;

function entitiesFromSeed(seed: SeedData): Entities {
  return {
    organization: seed.organization,
    users: seed.users,
    currentUserId: seed.currentUserId,
    projects: seed.projects,
    columns: seed.columns,
    tasks: seed.tasks,
    subtasks: seed.subtasks,
    comments: seed.comments,
    activities: seed.activities,
  };
}

function nextPositionForColumn(tasks: Task[], columnId: string): number {
  const inCol = tasks.filter((t) => t.columnId === columnId);
  if (inCol.length === 0) return 1024;
  const max = Math.max(...inCol.map((t) => t.position));
  return max + 1024;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...entitiesFromSeed(makeSeed()),

      reseed: () => set(() => entitiesFromSeed(makeSeed())),

      createProject: (input) => {
        const state = get();
        const project: Project = {
          id: uid("proj"),
          organizationId: state.organization.id,
          name: input.name,
          description: input.description ?? "",
          icon: input.icon ?? "📋",
          status: "active",
          memberIds: [state.currentUserId],
          favorite: false,
          createdAt: new Date().toISOString(),
          createdBy: state.currentUserId,
        };
        const newColumns: Column[] = DEFAULT_COLUMNS.map((c, idx) => ({
          id: uid("col"),
          projectId: project.id,
          name: c.name,
          position: (idx + 1) * 1024,
          createdAt: project.createdAt,
        }));
        set((s) => ({
          projects: [project, ...s.projects],
          columns: [...s.columns, ...newColumns],
        }));
        return project;
      },

      updateProject: (id, patch) => {
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        }));
      },

      deleteProject: (id) => {
        set((s) => {
          const colIds = new Set(
            s.columns.filter((c) => c.projectId === id).map((c) => c.id),
          );
          const taskIds = new Set(
            s.tasks.filter((t) => t.projectId === id).map((t) => t.id),
          );
          return {
            projects: s.projects.filter((p) => p.id !== id),
            columns: s.columns.filter((c) => c.projectId !== id),
            tasks: s.tasks.filter((t) => t.projectId !== id),
            subtasks: s.subtasks.filter((st) => !taskIds.has(st.taskId)),
            comments: s.comments.filter((cm) => !taskIds.has(cm.taskId)),
            activities: s.activities.filter((a) => !taskIds.has(a.taskId)),
          };
        });
      },

      toggleProjectFavorite: (id) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, favorite: !p.favorite } : p,
          ),
        }));
      },

      createColumn: (projectId, name) => {
        const state = get();
        const cols = state.columns.filter((c) => c.projectId === projectId);
        const position = cols.length === 0 ? 1024 : Math.max(...cols.map((c) => c.position)) + 1024;
        const col: Column = {
          id: uid("col"),
          projectId,
          name,
          position,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ columns: [...s.columns, col] }));
        return col;
      },

      renameColumn: (id, name) => {
        set((s) => ({
          columns: s.columns.map((c) => (c.id === id ? { ...c, name } : c)),
        }));
      },

      deleteColumn: (id) => {
        set((s) => {
          const col = s.columns.find((c) => c.id === id);
          if (!col) return s;
          const taskIds = new Set(
            s.tasks.filter((t) => t.columnId === id).map((t) => t.id),
          );
          return {
            ...s,
            columns: s.columns.filter((c) => c.id !== id),
            tasks: s.tasks.filter((t) => t.columnId !== id),
            subtasks: s.subtasks.filter((st) => !taskIds.has(st.taskId)),
            comments: s.comments.filter((cm) => !taskIds.has(cm.taskId)),
            activities: s.activities.filter((a) => !taskIds.has(a.taskId)),
          };
        });
      },

      reorderColumns: (projectId, ids) => {
        set((s) => ({
          columns: s.columns.map((c) => {
            if (c.projectId !== projectId) return c;
            const idx = ids.indexOf(c.id);
            return idx === -1 ? c : { ...c, position: (idx + 1) * 1024 };
          }),
        }));
      },

      createTask: (input) => {
        const state = get();
        const position = nextPositionForColumn(state.tasks, input.columnId);
        const task: Task = {
          id: uid("task"),
          projectId: input.projectId,
          columnId: input.columnId,
          title: input.title,
          description: input.description ?? "",
          priority: input.priority ?? "medium",
          dueDate: input.dueDate ?? null,
          assigneeId: input.assigneeId ?? null,
          labels: input.labels ?? [],
          position,
          createdAt: new Date().toISOString(),
          createdBy: state.currentUserId,
        };
        const activity = makeActivity(task.id, state.currentUserId, "created");
        set((s) => ({
          tasks: [...s.tasks, task],
          activities: [...s.activities, activity],
        }));
        return task;
      },

      updateTask: (id, patch, opts) => {
        const state = get();
        const prev = state.tasks.find((t) => t.id === id);
        if (!prev) return;
        const next: Task = { ...prev, ...patch };
        const acts: Activity[] = [];
        if (!opts?.silent) {
          if (patch.priority !== undefined && patch.priority !== prev.priority) {
            acts.push(
              makeActivity(id, state.currentUserId, "priority_changed", priorityLabel(patch.priority)),
            );
          }
          if (patch.assigneeId !== undefined && patch.assigneeId !== prev.assigneeId) {
            acts.push(
              makeActivity(
                id,
                state.currentUserId,
                "assigned",
                patch.assigneeId
                  ? state.users.find((u) => u.id === patch.assigneeId)?.name ?? "someone"
                  : "unassigned",
              ),
            );
          }
          if (patch.dueDate !== undefined && patch.dueDate !== prev.dueDate) {
            acts.push(
              makeActivity(id, state.currentUserId, "due_date_changed", patch.dueDate ?? "none"),
            );
          }
          if (patch.title !== undefined && patch.title !== prev.title) {
            acts.push(makeActivity(id, state.currentUserId, "title_changed"));
          }
          if (patch.description !== undefined && patch.description !== prev.description) {
            acts.push(makeActivity(id, state.currentUserId, "description_changed"));
          }
          if (patch.labels !== undefined) {
            acts.push(makeActivity(id, state.currentUserId, "labels_changed"));
          }
        }
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? next : t)),
          activities: acts.length === 0 ? s.activities : [...s.activities, ...acts],
        }));
      },

      moveTask: (id, toColumnId, toPosition) => {
        const state = get();
        const prev = state.tasks.find((t) => t.id === id);
        if (!prev) return;
        const movedCol = prev.columnId !== toColumnId;
        const acts: Activity[] = movedCol
          ? [
              makeActivity(
                id,
                state.currentUserId,
                "moved",
                state.columns.find((c) => c.id === toColumnId)?.name,
              ),
            ]
          : [];
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, columnId: toColumnId, position: toPosition } : t,
          ),
          activities: acts.length === 0 ? s.activities : [...s.activities, ...acts],
        }));
      },

      deleteTask: (id) => {
        set((s) => ({
          tasks: s.tasks.filter((t) => t.id !== id),
          subtasks: s.subtasks.filter((st) => st.taskId !== id),
          comments: s.comments.filter((cm) => cm.taskId !== id),
          activities: s.activities.filter((a) => a.taskId !== id),
        }));
      },

      addSubtask: (taskId, title) => {
        const state = get();
        const sub: Subtask = {
          id: uid("st"),
          taskId,
          title,
          completed: false,
          createdAt: new Date().toISOString(),
        };
        const act = makeActivity(taskId, state.currentUserId, "subtask_added", title);
        set((s) => ({ subtasks: [...s.subtasks, sub], activities: [...s.activities, act] }));
        return sub;
      },

      toggleSubtask: (id) => {
        const state = get();
        const prev = state.subtasks.find((s) => s.id === id);
        if (!prev) return;
        const completed = !prev.completed;
        const acts = completed
          ? [makeActivity(prev.taskId, state.currentUserId, "subtask_completed", prev.title)]
          : [];
        set((s) => ({
          subtasks: s.subtasks.map((st) => (st.id === id ? { ...st, completed } : st)),
          activities: acts.length === 0 ? s.activities : [...s.activities, ...acts],
        }));
      },

      renameSubtask: (id, title) => {
        set((s) => ({
          subtasks: s.subtasks.map((st) => (st.id === id ? { ...st, title } : st)),
        }));
      },

      deleteSubtask: (id) => {
        set((s) => ({ subtasks: s.subtasks.filter((st) => st.id !== id) }));
      },

      addComment: (taskId, content) => {
        const state = get();
        const comment: Comment = {
          id: uid("c"),
          taskId,
          userId: state.currentUserId,
          content,
          createdAt: new Date().toISOString(),
        };
        const act = makeActivity(taskId, state.currentUserId, "comment_added");
        set((s) => ({
          comments: [...s.comments, comment],
          activities: [...s.activities, act],
        }));
        return comment;
      },

      deleteComment: (id) => {
        set((s) => ({ comments: s.comments.filter((c) => c.id !== id) }));
      },
    }),
    {
      name: "cogna-store-v1",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);

function makeActivity(
  taskId: string,
  userId: string,
  kind: ActivityKind,
  detail?: string,
): Activity {
  return {
    id: uid("act"),
    taskId,
    userId,
    kind,
    detail,
    createdAt: new Date().toISOString(),
  };
}

function priorityLabel(p: Priority): string {
  return p[0].toUpperCase() + p.slice(1);
}

// Selectors

export function useCurrentUser() {
  return useStore((s) => s.users.find((u) => u.id === s.currentUserId)!);
}

export function useProject(projectId: string) {
  return useStore((s) => s.projects.find((p) => p.id === projectId));
}

export function useColumnsByProject(projectId: string) {
  return useStore((s) =>
    s.columns.filter((c) => c.projectId === projectId).sort((a, b) => a.position - b.position),
  );
}

export function useTasksByProject(projectId: string) {
  return useStore((s) => s.tasks.filter((t) => t.projectId === projectId));
}

export function useTask(taskId: string | null) {
  return useStore((s) => (taskId ? s.tasks.find((t) => t.id === taskId) : undefined));
}

export function useSubtasks(taskId: string | undefined) {
  return useStore((s) =>
    taskId
      ? s.subtasks.filter((st) => st.taskId === taskId).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      : [],
  );
}

export function useComments(taskId: string | undefined) {
  return useStore((s) =>
    taskId
      ? s.comments.filter((c) => c.taskId === taskId).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      : [],
  );
}

export function useActivities(taskId: string | undefined) {
  return useStore((s) =>
    taskId
      ? s.activities.filter((a) => a.taskId === taskId).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      : [],
  );
}

export function midpoint(a: number | undefined, b: number | undefined): number {
  if (a === undefined && b === undefined) return 1024;
  if (a === undefined) return (b ?? 0) - 512;
  if (b === undefined) return a + 1024;
  return (a + b) / 2;
}
