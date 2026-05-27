"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { NewProjectDialog } from "@/components/projects/new-project-dialog";
import { ProjectCard } from "@/components/projects/project-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store";

export default function ProjectsPage() {
  const allProjects = useStore((s) => s.projects);
  const [createOpen, setCreateOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const projects = allProjects
    .filter((p) => (showArchived ? p.status === "archived" : p.status === "active"))
    .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => Number(b.favorite) - Number(a.favorite) || a.name.localeCompare(b.name));

  return (
    <>
      <PageHeader
        title="Projects"
        subtitle="Each project is a Kanban with its own columns, members, and tasks."
        actions={
          <>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects…"
              className="h-9 w-48"
            />
            <Button variant="outline" size="sm" onClick={() => setShowArchived((v) => !v)}>
              {showArchived ? "Show active" : "Show archived"}
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              New project
            </Button>
          </>
        }
      />
      <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin">
        {projects.length === 0 ? (
          <div className="grid place-items-center rounded-lg border border-dashed border-border/60 px-6 py-16 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/15 text-primary-foreground">
              <Plus className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">
              {showArchived ? "No archived projects" : "Start a new project"}
            </h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {showArchived
                ? "Projects you archive show up here. They keep their data and can be unarchived anytime."
                : "Projects are the home for your Kanban boards. Each one ships with the five default columns: Backlog, Todo, In Progress, Review, Done."}
            </p>
            {!showArchived && (
              <Button className="mt-5" onClick={() => setCreateOpen(true)}>
                Create your first project
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </div>
      <NewProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
