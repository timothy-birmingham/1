import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { CURRENT_USER_COOKIE, getCurrentUserOrDefault } from "@/lib/auth/current-user";
import { withApiErrorHandling, ApiError } from "@/lib/api-utils";
import { listUsers } from "@/lib/services/users";

export const GET = withApiErrorHandling(async () => {
  const [currentUser, users] = await Promise.all([
    getCurrentUserOrDefault(),
    listUsers(),
  ]);

  // Bootstrap: the very first request has no cookie yet -- pin it to the
  // default user so subsequent requests (and the UI) agree on who's acting.
  const cookieStore = await cookies();
  if (!cookieStore.get(CURRENT_USER_COOKIE)) {
    cookieStore.set(CURRENT_USER_COOKIE, currentUser.id, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
    });
  }

  return NextResponse.json({ currentUser, users });
});

const switchUserSchema = z.object({ userId: z.string().min(1) });

export const POST = withApiErrorHandling(async (request: NextRequest) => {
  const body = switchUserSchema.parse(await request.json());

  const user = await prisma.user.findUnique({ where: { id: body.userId } });
  if (!user) throw new ApiError(404, "User not found");

  const cookieStore = await cookies();
  cookieStore.set(CURRENT_USER_COOKIE, user.id, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
  });

  return NextResponse.json({ currentUser: user });
});
