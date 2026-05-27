"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Star } from "lucide-react";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Project } from "@/lib/db/types";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function ProjectCard({ project }: { project: Project }) {
  const users = useStore((s) => s.users.filter((u) => project.memberIds.includes(u.id)));
  const taskCount = useStore((s) => s.tasks.filter((t) => t.projectId === project.id).length);
  const doneCount = useStore((s) => {
    const cols = s.columns.filter((c) => c.projectId === project.id);
    const doneCol = cols.find((c) => c.name.toLowerCase() === "done");
    if (!doneCol) return 0;
    return s.tasks.filter((t) => t.projectId === project.id && t.columnId === doneCol.id).length;
  });
  const progress = taskCount === 0 ? 0 : Math.round((doneCount / taskCount) * 100);

  const toggleFavorite = useStore((s) => s.toggleProjectFavorite);
  const deleteProject = useStore((s) => s.deleteProject);
  const updateProject = useStore((s) => s.updateProject);

  return (
    <div className="group flex flex-col rounded-lg border border-border bg-card p-4 transition-colors hover:border-border/80">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/projects/${project.id}`} className="flex min-w-0 flex-1 items-center gap-2">
          <span className="text-2xl leading-none">{project.icon}</span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">{project.name}</h3>
            <p className="truncate text-xs text-muted-foreground">
              Created {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleFavorite(project.id)}
            className={cn(
              "rounded p-1 text-muted-foreground transition-colors hover:bg-secondary",
              project.favorite && "text-amber-400",
            )}
            aria-label={project.favorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star className={cn("h-4 w-4", project.favorite && "fill-amber-400")} />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() =>
                  updateProject(project.id, {
                    status: project.status === "active" ? "archived" : "active",
                  })
                }
              >
                {project.status === "active" ? "Archive" : "Unarchive"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onSelect={() => {
                  if (
                    confirm(`Delete "${project.name}"? All tasks, subtasks, and comments will be removed.`)
                  ) {
                    deleteProject(project.id);
                  }
                }}
              >
                Delete project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {project.description && (
        <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{project.description}</p>
      )}

      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Progress</span>
          <span>
            {doneCount}/{taskCount}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex -space-x-1.5">
          {users.slice(0, 4).map((u) => (
            <UserAvatar key={u.id} user={u} size="xs" className="ring-2 ring-card" />
          ))}
          {users.length > 4 && (
            <span className="ml-1 text-[11px] text-muted-foreground">+{users.length - 4}</span>
          )}
        </div>
        <span className="text-[11px] text-muted-foreground">{progress}%</span>
      </div>
    </div>
  );
}
