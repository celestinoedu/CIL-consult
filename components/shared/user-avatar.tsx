"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { User } from "@/lib/db/types";
import { cn, initials } from "@/lib/utils";

type Props = {
  user: User | undefined;
  size?: "xs" | "sm" | "md";
  className?: string;
};

const sizes: Record<NonNullable<Props["size"]>, string> = {
  xs: "h-5 w-5 text-[10px]",
  sm: "h-6 w-6 text-[11px]",
  md: "h-8 w-8 text-xs",
};

export function UserAvatar({ user, size = "sm", className }: Props) {
  if (!user) {
    return (
      <Avatar className={cn(sizes[size], className)}>
        <AvatarFallback className="bg-muted text-muted-foreground">?</AvatarFallback>
      </Avatar>
    );
  }
  return (
    <Avatar className={cn(sizes[size], className)}>
      <AvatarFallback className={user.avatarColor}>{initials(user.name)}</AvatarFallback>
    </Avatar>
  );
}
