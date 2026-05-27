"use client";

import { notFound } from "next/navigation";
import { use, useState } from "react";
import { Star } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { KanbanBoard } from "@/components/kanban/board";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useProject, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const project = useProject(id);
  const users = useStore((s) =>
    project ? s.users.filter((u) => project.memberIds.includes(u.id)) : [],
  );
  const tasksCount = useStore((s) => s.tasks.filter((t) => t.projectId === id).length);
  const toggleFavorite = useStore((s) => s.toggleProjectFavorite);

  if (!project) return notFound();

  return (
    <>
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <span className="text-xl leading-none">{project.icon}</span>
            <span>{project.name}</span>
          </span>
        }
        subtitle={
          project.description || `${tasksCount} task${tasksCount === 1 ? "" : "s"} on this board.`
        }
        actions={
          <>
            <div className="flex -space-x-1.5">
              {users.slice(0, 5).map((u) => (
                <Tooltip key={u.id}>
                  <TooltipTrigger asChild>
                    <span>
                      <UserAvatar user={u} size="sm" className="ring-2 ring-background" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{u.name}</TooltipContent>
                </Tooltip>
              ))}
              {users.length > 5 && (
                <span className="ml-1 text-[11px] text-muted-foreground">+{users.length - 5}</span>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toggleFavorite(project.id)}
              className={cn(project.favorite && "text-amber-400")}
            >
              <Star className={cn("h-4 w-4", project.favorite && "fill-amber-400")} />
              {project.favorite ? "Favorited" : "Favorite"}
            </Button>
          </>
        }
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <KanbanBoard projectId={project.id} />
      </div>
    </>
  );
}
