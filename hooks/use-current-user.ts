"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { UserDTO } from "@/lib/types";

interface SessionResponse {
  currentUser: UserDTO;
  users: UserDTO[];
}

async function fetchSession(): Promise<SessionResponse> {
  const res = await fetch("/api/session");
  if (!res.ok) throw new Error("Failed to load session");
  return res.json();
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["session"],
    queryFn: fetchSession,
    staleTime: Infinity,
  });
}

export function useSwitchUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch("/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Failed to switch user");
      return res.json() as Promise<{ currentUser: UserDTO }>;
    },
    onSuccess: () => {
      // Invalidate everything -- RBAC-gated views and "created by me" data
      // all depend on who's acting, so a user switch should refresh the
      // whole app's data, not just the session query.
      queryClient.invalidateQueries();
    },
  });
}
