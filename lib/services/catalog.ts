import "server-only";
import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/lib/api-utils";
import type { CatalogItemInput } from "@/lib/validations/catalog";
import type { CatalogItemDTO } from "@/lib/types";

export async function listCatalogItems(): Promise<CatalogItemDTO[]> {
  const items = await prisma.equipmentCatalogItem.findMany({
    orderBy: { name: "asc" },
  });
  return items;
}

export async function createCatalogItem(
  input: CatalogItemInput
): Promise<CatalogItemDTO> {
  return prisma.equipmentCatalogItem.create({
    data: {
      name: input.name,
      category: input.category || null,
      active: input.active ?? true,
    },
  });
}

export async function updateCatalogItem(
  id: string,
  input: CatalogItemInput
): Promise<CatalogItemDTO> {
  const existing = await prisma.equipmentCatalogItem.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError("Catalog item not found");

  return prisma.equipmentCatalogItem.update({
    where: { id },
    data: {
      name: input.name,
      category: input.category || null,
      active: input.active ?? true,
    },
  });
}

export async function deleteCatalogItem(id: string): Promise<void> {
  const existing = await prisma.equipmentCatalogItem.findUnique({ where: { id } });
  if (!existing) throw new NotFoundError("Catalog item not found");
  await prisma.equipmentCatalogItem.delete({ where: { id } });
}
