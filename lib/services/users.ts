import "server-only";
import { prisma } from "@/lib/prisma";
import type { UserDTO } from "@/lib/types";

export async function listUsers(): Promise<UserDTO[]> {
  return prisma.user.findMany({ orderBy: { name: "asc" } });
}
