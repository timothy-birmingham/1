import { z } from "zod";

export const catalogItemSchema = z.object({
  name: z.string().trim().min(1, "Item name is required").max(100),
  category: z.string().trim().max(100).optional(),
  active: z.boolean().optional().default(true),
});

export type CatalogItemInput = z.infer<typeof catalogItemSchema>;

export const rolePackageItemSchema = z.object({
  name: z.string().trim().min(1, "Item name is required").max(100),
  quantity: z.coerce.number().int().min(1).max(50),
});

export const rolePackageSchema = z.object({
  roleName: z.string().trim().min(1, "Role name is required").max(120),
  items: z.array(rolePackageItemSchema).max(50).default([]),
});

export type RolePackageInput = z.infer<typeof rolePackageSchema>;
