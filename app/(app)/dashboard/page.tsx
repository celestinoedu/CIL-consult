"use client";

import Link from "next/link";
import { differenceInCalendarDays } from "date-fns";
import { AlertCircle, CheckCircle2, ListTodo, Sparkles, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { DueDate } from "@/components/shared/due-date";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export default function DashboardPage() {
  const projects = useStore((s) => s.projects.filter((p) => p.status === "active"));
  const tasks = useStore((s) => s.tasks);
  const columns = useStore((s) => s.columns);
  const users = useStore((s) => s.users);

  const doneColumnIds = new Set(
    columns.filter((c) => c.name.toLowerCase() === "done").map((c) => c.id),
  );
  const inProgressColumnIds = new Set(
    columns.filter((c) => c.name.toLowerCase() === "in progress").map((c) => c.id),
  );

  const total = tasks.length;
  const done = tasks.filter((t) => doneColumnIds.has(t.columnId)).length;
  const inProgress = tasks.filter((t) => inProgressColumnIds.has(t.columnId)).length;
  const overdue = tasks.filter(
    (t) => t.dueDate && !doneColumnIds.has(t.columnId) && differenceInCalendarDays(new Date(t.dueDate), new Date()) < 0,
  ).length;
  const progress = total === 0 ? 0 : Math.round((done / total) * 100);

  const upcoming = tasks
    .filter((t) => t.dueDate && !doneColumnIds.has(t.columnId))
    .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""))
    .slice(0, 6);

  const projectById = new Map(projects.map((p) => [p.id, p]));

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="A quick read on operational momentum across your projects."
      />
      <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin">
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard
            label="Total tasks"
            value={total}
            icon={<ListTodo className="h-4 w-4" />}
            hint={`${projects.length} active project${projects.length === 1 ? "" : "s"}`}
          />
          <MetricCard
            label="Completed"
            value={done}
            tone="accent"
            icon={<CheckCircle2 className="h-4 w-4" />}
            hint={`${progress}% of all tasks`}
          />
          <MetricCard
            label="In progress"
            value={inProgress}
            icon={<Sparkles className="h-4 w-4" />}
            hint="actively being worked on"
          />
          <MetricCard
            label="Overdue"
            value={overdue}
            tone={overdue > 0 ? "danger" : "default"}
            icon={<AlertCircle className="h-4 w-4" />}
            hint={overdue > 0 ? "needs attention" : "all clear"}
          />
        </section>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-4 lg:col-span-2">
            <header className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">Upcoming</h2>
                <p className="text-xs text-muted-foreground">Next deadlines across your projects.</p>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </header>
            {upcoming.length === 0 ? (
              <div className="rounded-md border border-dashed border-border/60 px-4 py-8 text-center text-xs text-muted-foreground">
                Nothing on the horizon. Add a due date to a task to see it here.
              </div>
            ) : (
              <ul className="flex flex-col divide-y divide-border/60">
                {upcoming.map((t) => {
                  const project = projectById.get(t.projectId);
                  const assignee = users.find((u) => u.id === t.assigneeId);
                  return (
                    <li key={t.id} className="flex items-center gap-3 py-2.5">
                      <Link
                        href={`/projects/${t.projectId}`}
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-secondary text-base"
                      >
                        {project?.icon ?? "📋"}
                      </Link>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{t.title}</div>
                        <div className="truncate text-[11px] text-muted-foreground">
                          {project?.name ?? "—"}
                        </div>
                      </div>
                      <PriorityBadge priority={t.priority} />
                      <DueDate value={t.dueDate} />
                      {assignee && <UserAvatar user={assignee} size="xs" />}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <h2 className="text-sm font-semibold">Projects</h2>
            <p className="text-xs text-muted-foreground">Status snapshot.</p>
            <ul className="mt-3 flex flex-col gap-2">
              {projects.slice(0, 6).map((p) => {
                const projectTasks = tasks.filter((t) => t.projectId === p.id);
                const projectDone = projectTasks.filter((t) => doneColumnIds.has(t.columnId)).length;
                const pct =
                  projectTasks.length === 0 ? 0 : Math.round((projectDone / projectTasks.length) * 100);
                return (
                  <li key={p.id}>
                    <Link
                      href={`/projects/${p.id}`}
                      className="flex items-center gap-3 rounded-md border border-transparent px-2 py-1.5 transition-colors hover:border-border hover:bg-secondary/50"
                    >
                      <span className="text-base">{p.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{p.name}</div>
                        <div className="h-1 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full bg-accent transition-[width]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">{pct}%</span>
                    </Link>
                  </li>
                );
              })}
              {projects.length === 0 && (
                <li className="rounded-md border border-dashed border-border/60 px-3 py-6 text-center text-xs text-muted-foreground">
                  No projects yet.{" "}
                  <Link href="/projects" className="text-foreground underline-offset-4 hover:underline">
                    Create one
                  </Link>
                  .
                </li>
              )}
            </ul>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-dashed border-border/60 bg-surface/40 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Operating principle</h2>
              <p className="mt-1 max-w-prose text-xs text-muted-foreground">
                Cogna defaults to action: today&apos;s commitments, this week&apos;s deadlines, no clutter. If a feature can&apos;t justify itself on this screen, it doesn&apos;t belong in the MVP.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/projects">Go to projects</Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
