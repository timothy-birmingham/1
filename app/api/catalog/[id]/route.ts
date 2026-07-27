import { NextRequest, NextResponse } from "next/server";
import { withApiErrorHandling } from "@/lib/api-utils";
import { requireRole } from "@/lib/auth/current-user";
import { catalogItemSchema } from "@/lib/validations/catalog";
import { deleteCatalogItem, updateCatalogItem } from "@/lib/services/catalog";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const PATCH = withApiErrorHandling(
  async (request: NextRequest, { params }: RouteParams) => {
    await requireRole(["IT"]);
    const { id } = await params;
    const input = catalogItemSchema.parse(await request.json());
    const updated = await updateCatalogItem(id, input);
    return NextResponse.json(updated);
  }
);

export const DELETE = withApiErrorHandling(
  async (_request: NextRequest, { params }: RouteParams) => {
    await requireRole(["IT"]);
    const { id } = await params;
    await deleteCatalogItem(id);
    return new NextResponse(null, { status: 204 });
  }
);
