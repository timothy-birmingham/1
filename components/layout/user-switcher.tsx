"use client";

import { Check, ChevronsUpDown, User as UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCurrentUser, useSwitchUser } from "@/hooks/use-current-user";
import { USER_ROLE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UserSwitcher() {
  const { data, isLoading } = useCurrentUser();
  const switchUser = useSwitchUser();

  if (isLoading || !data) {
    return (
      <div className="flex items-center gap-2 rounded-lg px-2 py-2 text-sidebar-foreground/70 text-sm">
        <UserIcon className="size-4" />
        Loading…
      </div>
    );
  }

  const { currentUser, users } = data;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sidebar-foreground transition hover:bg-sidebar-accent"
          aria-label="Switch acting user"
        >
          <Avatar className="size-8 border border-sidebar-border">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs font-semibold">
              {initials(currentUser.name)}
            </AvatarFallback>
          </Avatar>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">
              {currentUser.name}
            </span>
            <span className="block truncate text-xs text-sidebar-foreground/70">
              Acting as {USER_ROLE_LABELS[currentUser.role]}
            </span>
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-sidebar-foreground/60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" className="w-64">
        <DropdownMenuLabel>Acting as</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {users.map((user) => (
          <DropdownMenuItem
            key={user.id}
            onClick={() => {
              if (user.id !== currentUser.id) switchUser.mutate(user.id);
            }}
            className="flex items-center justify-between gap-2"
          >
            <span className="min-w-0">
              <span className="block truncate text-sm">{user.name}</span>
              <span className="block truncate text-xs text-muted-foreground">
                {USER_ROLE_LABELS[user.role]} · {user.department}
              </span>
            </span>
            <Check
              className={cn(
                "size-4 shrink-0",
                user.id === currentUser.id ? "opacity-100" : "opacity-0"
              )}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
