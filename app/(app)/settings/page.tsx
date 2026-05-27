"use client";

import { PageHeader } from "@/components/layout/page-header";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCurrentUser, useStore } from "@/lib/store";

export default function SettingsPage() {
  const user = useCurrentUser();
  const organization = useStore((s) => s.organization);
  const reseed = useStore((s) => s.reseed);

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Workspace, account, and prototype data."
      />
      <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-thin">
        <div className="mx-auto flex max-w-2xl flex-col gap-6">
          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Workspace</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Your organization. In the prototype this is read-only — Supabase auth will own it later.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <div>
                <Label>Organization name</Label>
                <Input value={organization.name} disabled className="mt-1" />
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Account</h2>
            <div className="mt-4 flex items-center gap-3">
              <UserAvatar user={user} size="md" />
              <div className="flex-1">
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-5">
            <h2 className="text-sm font-semibold">Prototype data</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Cogna&apos;s first version persists data in your browser&apos;s localStorage. Resetting
              regenerates the seed projects and tasks.
            </p>
            <Separator className="my-4" />
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (
                    confirm(
                      "Reset all local data? This wipes projects, tasks, and comments stored in your browser.",
                    )
                  ) {
                    localStorage.removeItem("cogna-store-v1");
                    reseed();
                  }
                }}
              >
                Reset to seed data
              </Button>
              <span className="text-xs text-muted-foreground">
                When Supabase is wired up, this control will be removed.
              </span>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
