import type {
  Activity,
  Column,
  Comment,
  Organization,
  Project,
  Subtask,
  Task,
  User,
} from "./types";
import { DEFAULT_COLUMNS } from "../constants";
import { uid } from "../utils";

export type SeedData = {
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

function nowMinus(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

function nowPlus(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

export function makeSeed(): SeedData {
  const orgId = uid("org");
  const userId = uid("u");
  const teammate1 = uid("u");
  const teammate2 = uid("u");

  const organization: Organization = {
    id: orgId,
    name: "Acme Studio",
    createdAt: nowMinus(7),
  };

  const users: User[] = [
    { id: userId, name: "You", email: "you@cogna.app", avatarColor: "bg-teal-600" },
    { id: teammate1, name: "Maya Lin", email: "maya@cogna.app", avatarColor: "bg-violet-600" },
    { id: teammate2, name: "Theo Park", email: "theo@cogna.app", avatarColor: "bg-amber-600" },
  ];

  const projectId = uid("proj");
  const projects: Project[] = [
    {
      id: projectId,
      organizationId: orgId,
      name: "Cogna Launch",
      description: "Ship the operational Kanban prototype to early users.",
      icon: "🚀",
      status: "active",
      memberIds: [userId, teammate1, teammate2],
      favorite: true,
      createdAt: nowMinus(7),
      createdBy: userId,
    },
    {
      id: uid("proj"),
      organizationId: orgId,
      name: "Marketing Site",
      description: "Landing page and waitlist.",
      icon: "🌐",
      status: "active",
      memberIds: [userId, teammate1],
      favorite: false,
      createdAt: nowMinus(5),
      createdBy: userId,
    },
  ];

  const columns: Column[] = DEFAULT_COLUMNS.map((col, idx) => ({
    id: uid("col"),
    projectId,
    name: col.name,
    position: (idx + 1) * 1024,
    createdAt: nowMinus(7),
  }));

  const t = (
    title: string,
    columnIdx: number,
    pos: number,
    extras: Partial<Task> = {},
  ): Task => ({
    id: uid("task"),
    projectId,
    columnId: columns[columnIdx].id,
    title,
    description: "",
    priority: "medium",
    dueDate: null,
    assigneeId: null,
    labels: [],
    position: pos,
    createdAt: nowMinus(6),
    createdBy: userId,
    ...extras,
  });

  const tasks: Task[] = [
    t("Define brand tokens and dark theme", 4, 1024, {
      priority: "high",
      assigneeId: userId,
      labels: ["design", "brand"],
      description: "Lock the Deep Teal / Graphite / Neon Green palette and document tokens.",
    }),
    t("Wire Supabase project + RLS skeleton", 3, 1024, {
      priority: "high",
      assigneeId: teammate1,
      labels: ["backend"],
      dueDate: nowPlus(3),
    }),
    t("Implement Kanban drag & drop", 2, 1024, {
      priority: "critical",
      assigneeId: userId,
      labels: ["frontend", "kanban"],
      description: "Use dnd-kit. Persist positions with midpoint algorithm.",
      dueDate: nowPlus(2),
    }),
    t("Task modal — comments + subtasks", 2, 2048, {
      priority: "high",
      assigneeId: teammate2,
      labels: ["frontend"],
    }),
    t("Empty-state copy across the app", 1, 1024, {
      priority: "low",
      assigneeId: teammate1,
      labels: ["copy"],
    }),
    t("Set up Vercel preview deploys", 1, 2048, {
      priority: "medium",
      assigneeId: userId,
      labels: ["devops"],
    }),
    t("Investigate dnd-kit accessibility", 0, 1024, {
      priority: "medium",
      labels: ["research", "a11y"],
    }),
    t("AI: generate description prompt v1", 0, 2048, {
      priority: "low",
      labels: ["ai"],
    }),
  ];

  const subtasks: Subtask[] = [
    {
      id: uid("st"),
      taskId: tasks[2].id,
      title: "Set up DndContext + SortableContext",
      completed: true,
      createdAt: nowMinus(5),
    },
    {
      id: uid("st"),
      taskId: tasks[2].id,
      title: "Position math — midpoint between neighbors",
      completed: true,
      createdAt: nowMinus(5),
    },
    {
      id: uid("st"),
      taskId: tasks[2].id,
      title: "Optimistic update + rollback",
      completed: false,
      createdAt: nowMinus(4),
    },
    {
      id: uid("st"),
      taskId: tasks[2].id,
      title: "Keyboard reorder fallback",
      completed: false,
      createdAt: nowMinus(2),
    },
    {
      id: uid("st"),
      taskId: tasks[0].id,
      title: "Document Deep Teal usage",
      completed: true,
      createdAt: nowMinus(3),
    },
  ];

  const comments: Comment[] = [
    {
      id: uid("c"),
      taskId: tasks[2].id,
      userId: teammate1,
      content: "Should we also support keyboard reorder for accessibility?",
      createdAt: nowMinus(2),
    },
    {
      id: uid("c"),
      taskId: tasks[2].id,
      userId,
      content: "Yes — let's land mouse drag first, keyboard as a follow-up subtask.",
      createdAt: nowMinus(1),
    },
  ];

  const activities: Activity[] = tasks.map((task) => ({
    id: uid("act"),
    taskId: task.id,
    userId,
    kind: "created" as const,
    createdAt: task.createdAt,
  }));

  return {
    organization,
    users,
    currentUserId: userId,
    projects,
    columns,
    tasks,
    subtasks,
    comments,
    activities,
  };
}
