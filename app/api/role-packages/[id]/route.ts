import { NextRequest, NextResponse } from "next/server";
import { withApiErrorHandling } from "@/lib/api-utils";
import { requireRole } from "@/lib/auth/current-user";
import { rolePackageSchema } from "@/lib/validations/catalog";
import {
  deleteRolePackage,
  updateRolePackage,
} from "@/lib/services/role-packages";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export const PATCH = withApiErrorHandling(
  async (request: NextRequest, { params }: RouteParams) => {
    await requireRole(["IT"]);
    const { id } = await params;
    const input = rolePackageSchema.parse(await request.json());
    const updated = await updateRolePackage(id, input);
    return NextResponse.json(updated);
  }
);

export const DELETE = withApiErrorHandling(
  async (_request: NextRequest, { params }: RouteParams) => {
    await requireRole(["IT"]);
    const { id } = await params;
    await deleteRolePackage(id);
    return new NextResponse(null, { status: 204 });
  }
);
