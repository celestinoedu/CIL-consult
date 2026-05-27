"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  LayoutDashboard,
  Plus,
  Settings,
  Star,
  Folder,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { UserAvatar } from "@/components/shared/user-avatar";
import { useCurrentUser, useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { NewProjectDialog } from "@/components/projects/new-project-dialog";

export function Sidebar() {
  const pathname = usePathname();
  const user = useCurrentUser();
  const organization = useStore((s) => s.organization);
  const projects = useStore((s) =>
    s.projects.filter((p) => p.status === "active").sort((a, b) => a.name.localeCompare(b.name)),
  );
  const favorites = projects.filter((p) => p.favorite);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex items-center justify-between px-4 py-4">
        <Logo />
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">v0.1</div>
      </div>

      <div className="px-3 pb-1">
        <div className="rounded-md border border-border bg-card px-2.5 py-2 text-xs">
          <div className="truncate font-medium">{organization.name}</div>
          <div className="truncate text-muted-foreground">Operational workspace</div>
        </div>
      </div>

      <nav className="mt-3 flex flex-col gap-0.5 px-2 text-sm">
        <NavItem href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} active={pathname === "/dashboard"}>
          Dashboard
        </NavItem>
        <NavItem href="/projects" icon={<Folder className="h-4 w-4" />} active={pathname === "/projects"}>
          Projects
        </NavItem>
      </nav>

      {favorites.length > 0 && (
        <div className="mt-4 px-2">
          <SectionLabel>Favorites</SectionLabel>
          <ul className="mt-1 flex flex-col gap-0.5">
            {favorites.map((p) => (
              <li key={p.id}>
                <ProjectLink
                  href={`/projects/${p.id}`}
                  active={pathname === `/projects/${p.id}`}
                  icon={p.icon}
                  name={p.name}
                  favorite
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 flex min-h-0 flex-1 flex-col px-2">
        <div className="flex items-center justify-between pr-1">
          <SectionLabel>Projects</SectionLabel>
          <button
            onClick={() => setCreateOpen(true)}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="New project"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <ul className="mt-1 flex-1 overflow-y-auto pb-2 scrollbar-thin">
          {projects.map((p) => (
            <li key={p.id}>
              <ProjectLink
                href={`/projects/${p.id}`}
                active={pathname === `/projects/${p.id}`}
                icon={p.icon}
                name={p.name}
              />
            </li>
          ))}
          {projects.length === 0 && (
            <li className="px-2 py-3 text-xs text-muted-foreground">No projects yet.</li>
          )}
        </ul>
      </div>

      <div className="border-t border-border px-2 py-3">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
            pathname === "/settings" && "bg-secondary text-foreground",
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <div className="mt-2 flex items-center gap-2 rounded-md px-2 py-1.5">
          <UserAvatar user={user} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{user.name}</div>
            <div className="truncate text-xs text-muted-foreground">{user.email}</div>
          </div>
        </div>
      </div>

      <NewProjectDialog open={createOpen} onOpenChange={setCreateOpen} />
    </aside>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
      {children}
    </div>
  );
}

function NavItem({
  href,
  icon,
  active,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
        active && "bg-secondary text-foreground",
      )}
    >
      {icon}
      {children}
    </Link>
  );
}

function ProjectLink({
  href,
  active,
  icon,
  name,
  favorite,
}: {
  href: string;
  active: boolean;
  icon: string;
  name: string;
  favorite?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
        active && "bg-secondary text-foreground",
      )}
    >
      <span className="text-base leading-none">{icon}</span>
      <span className="flex-1 truncate">{name}</span>
      {favorite && <Star className="h-3 w-3 fill-amber-400 text-amber-400" />}
      <ChevronRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-60" />
    </Link>
  );
}
