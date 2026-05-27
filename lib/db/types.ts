import { z } from "zod";

export const PrioritySchema = z.enum(["low", "medium", "high", "critical"]);
export type Priority = z.infer<typeof PrioritySchema>;

export const ProjectStatusSchema = z.enum(["active", "archived"]);
export type ProjectStatus = z.infer<typeof ProjectStatusSchema>;

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  avatarColor: z.string(),
});
export type User = z.infer<typeof UserSchema>;

export const OrganizationSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.string(),
});
export type Organization = z.infer<typeof OrganizationSchema>;

export const ProjectSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  name: z.string().min(1).max(80),
  description: z.string().max(500).optional().default(""),
  icon: z.string().default("📋"),
  status: ProjectStatusSchema.default("active"),
  memberIds: z.array(z.string()).default([]),
  favorite: z.boolean().default(false),
  createdAt: z.string(),
  createdBy: z.string(),
});
export type Project = z.infer<typeof ProjectSchema>;

export const ColumnSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  name: z.string().min(1).max(40),
  position: z.number(),
  wipLimit: z.number().int().nonnegative().optional(),
  createdAt: z.string(),
});
export type Column = z.infer<typeof ColumnSchema>;

export const SubtaskSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  title: z.string().min(1).max(200),
  completed: z.boolean().default(false),
  createdAt: z.string(),
});
export type Subtask = z.infer<typeof SubtaskSchema>;

export const CommentSchema = z.object({
  id: z.string(),
  taskId: z.string(),
  userId: z.string(),
  content: z.string().min(1).max(2000),
  createdAt: z.string(),
});
export type Comment = z.infer<typeof CommentSchema>;

export const ActivityKindSchema = z.enum([
  "created",
  "moved",
  "priority_changed",
  "assigned",
  "due_date_changed",
  "title_changed",
  "description_changed",
  "labels_changed",
  "subtask_added",
  "subtask_completed",
  "comment_added",
]);
export type ActivityKind = z.infer<typeof ActivityKindSchema>;

export const ActivitySchema = z.object({
  id: z.string(),
  taskId: z.string(),
  userId: z.string(),
  kind: ActivityKindSchema,
  detail: z.string().optional(),
  createdAt: z.string(),
});
export type Activity = z.infer<typeof ActivitySchema>;

export const TaskSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  columnId: z.string(),
  title: z.string().min(1).max(140),
  description: z.string().max(5000).default(""),
  priority: PrioritySchema.default("medium"),
  dueDate: z.string().nullable().default(null),
  assigneeId: z.string().nullable().default(null),
  labels: z.array(z.string()).default([]),
  position: z.number(),
  createdAt: z.string(),
  createdBy: z.string(),
});
export type Task = z.infer<typeof TaskSchema>;

export const TaskCreateInput = TaskSchema.pick({
  projectId: true,
  columnId: true,
  title: true,
}).extend({
  description: z.string().max(5000).optional(),
  priority: PrioritySchema.optional(),
  dueDate: z.string().nullable().optional(),
  assigneeId: z.string().nullable().optional(),
  labels: z.array(z.string()).optional(),
});
export type TaskCreateInput = z.infer<typeof TaskCreateInput>;

export const ProjectCreateInput = ProjectSchema.pick({
  name: true,
}).extend({
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
});
export type ProjectCreateInput = z.infer<typeof ProjectCreateInput>;
