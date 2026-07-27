import "server-only";
import { cookies } from "next/headers";
import type { User, UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Simulated authentication layer.
 *
 * There is no real login yet -- the sidebar's "Acting as" switcher sets this
 * cookie to a User id, and every server component / API route reads the
 * current user through this module. Nothing else in the app talks to
 * cookies directly.
 *
 * To add real Microsoft Entra ID auth later: swap this module's
 * implementation for one backed by NextAuth's Azure AD provider (matching
 * User rows by email), while keeping the same `getCurrentUser()` /
 * `requireUser()` signatures so call sites -- API routes, pages, RBAC checks
 * -- don't need to change.
 */

export const CURRENT_USER_COOKIE = "vesta_current_user_id";

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(CURRENT_USER_COOKIE)?.value;
  if (!userId) return null;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user ?? null;
}

/** Falls back to the first IT user so the app has a sane identity even
 * before the switcher has been used once (e.g. direct API calls in tests). */
export async function getCurrentUserOrDefault(): Promise<User> {
  const user = await getCurrentUser();
  if (user) return user;

  const fallback = await prisma.user.findFirst({
    where: { role: "IT" },
    orderBy: { createdAt: "asc" },
  });
  if (!fallback) {
    throw new Error(
      "No users exist yet -- run `npm run db:seed` to create demo users."
    );
  }
  return fallback;
}

export class ForbiddenError extends Error {
  status = 403 as const;
  constructor(message = "You don't have permission to do that.") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/** Throws a ForbiddenError (caught by lib/api-utils' error handler) unless
 * the current user's role is in `allowed`. Enforced server-side in every API
 * route that needs it -- not just hidden in the UI. */
export async function requireRole(allowed: UserRole[]): Promise<User> {
  const user = await getCurrentUserOrDefault();
  if (!allowed.includes(user.role)) {
    throw new ForbiddenError(
      `This action requires one of these roles: ${allowed.join(", ")}.`
    );
  }
  return user;
}
