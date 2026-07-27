import "server-only";
import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/api-utils";
import type { RolePackageInput } from "@/lib/validations/catalog";
import type { RolePackageDTO } from "@/lib/types";

const include = { items: { select: { id: true, name: true, quantity: true } } };

export async function listRolePackages(): Promise<RolePackageDTO[]> {
  const packages = await prisma.rolePackage.findMany({
    include,
    orderBy: { roleName: "asc" },
  });
  return packages;
}

export async function createRolePackage(
  input: RolePackageInput
): Promise<RolePackageDTO> {
  return prisma.rolePackage.create({
    data: {
      roleName: input.roleName,
      items: { create: input.items },
    },
    include,
  });
}

export async function updateRolePackage(
  id: string,
  input: RolePackageInput
): Promise<RolePackageDTO> {
  const existing = await prisma.rolePackage.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError("Role package not found");

  return prisma.rolePackage.update({
    where: { id },
    data: {
      roleName: input.roleName,
      items: {
        deleteMany: {},
        create: input.items,
      },
    },
    include,
  });
}

export async function deleteRolePackage(id: string): Promise<void> {
  const existing = await prisma.rolePackage.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError("Role package not found");
  await prisma.rolePackage.delete({ where: { id } });
}
