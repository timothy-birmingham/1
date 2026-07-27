import { NextRequest, NextResponse } from "next/server";
import { withApiErrorHandling } from "@/lib/api-utils";
import { requireRole } from "@/lib/auth/current-user";
import { catalogItemSchema } from "@/lib/validations/catalog";
import { createCatalogItem, listCatalogItems } from "@/lib/services/catalog";

export const GET = withApiErrorHandling(async () => {
  const items = await listCatalogItems();
  return NextResponse.json(items);
});

export const POST = withApiErrorHandling(async (request: NextRequest) => {
  await requireRole(["IT"]);
  const input = catalogItemSchema.parse(await request.json());
  const created = await createCatalogItem(input);
  return NextResponse.json(created, { status: 201 });
});
